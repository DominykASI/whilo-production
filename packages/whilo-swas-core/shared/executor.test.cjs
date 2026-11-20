"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./index.cjs");
const executorApi = require("./executor.cjs");

function runningMission(steps, missionInput) {
  let mission = core.createMission(Object.assign(
    { id: "exec-" + Date.now(), goal: "Execute delegated Bot work", steps: steps },
    missionInput || {}
  ));
  mission = core.transitionMission(mission, "planned", "pet", "Plan ready");
  mission = core.transitionMission(mission, "awaiting_approval", "governor", "Approval required");
  mission = core.approveMission(mission, { approved: true, approver: "owner" });
  mission = core.transitionMission(mission, "running", "runtime", "Run approved");
  return mission;
}

test("a task with host evidence completes through the executor adapter", async () => {
  const mission = runningMission([{ id: "research", role: "Browser Researcher", title: "Research accounts" }], { budget: 10 });
  const executor = executorApi.createExecutor(async (task, context) => ({
    output: "Two accounts match the ICP",
    evidence: ["https://example.com/accounts"],
    cost: 1
  }));
  const result = await core.runMissionWave(mission, executor, { maxParallelism: 2 });
  assert.deepEqual(result.completed, ["research"]);
  assert.deepEqual(result.failed, []);
  assert.equal(result.mission.tasks[0].status, "completed");
  assert.equal(result.mission.tasks[0].result.output, "Two accounts match the ICP");
  assert.deepEqual(result.mission.evidence, ["https://example.com/accounts"]);
});

test("a task without evidence fails closed and records no success", async () => {
  const mission = runningMission([{ id: "work", title: "Do work" }], { budget: 10 });
  const executor = executorApi.createExecutor(async () => ({ output: "I claim it worked" }));
  const result = await core.runMissionWave(mission, executor);
  assert.deepEqual(result.completed, []);
  assert.deepEqual(result.failed, ["work"]);
  assert.equal(result.mission.tasks[0].status, "failed");
  assert.match(result.mission.tasks[0].error, /evidence/);
  assert.deepEqual(result.mission.evidence, []);
});

test("a missing tool scope fails before the host is delegated to", async () => {
  const mission = runningMission([{ id: "send", title: "Send email", toolScopes: ["read", "external_send"] }], { budget: 10 });
  const task = mission.tasks[0];
  const context = {
    missionId: mission.id,
    goal: mission.goal,
    department: mission.department,
    ownerPet: mission.ownerPet,
    budget: mission.budget,
    budgetCurrency: mission.budgetCurrency,
    acceptanceCriteria: mission.acceptanceCriteria.slice(),
    toolScopes: ["read"]
  };
  let called = false;
  const executor = executorApi.createExecutor(async () => {
    called = true;
    return { output: "Sent", evidence: ["log://send"] };
  });
  await assert.rejects(executor(task, context), /Missing required capability scopes: external_send/);
  assert.equal(called, false);
});

test("an exceeded budget fails before the host is delegated to", async () => {
  const mission = runningMission([{ id: "work", title: "Expensive work", estimatedCost: 5 }], { budget: 1 });
  const task = mission.tasks[0];
  const context = {
    missionId: mission.id,
    goal: mission.goal,
    department: mission.department,
    ownerPet: mission.ownerPet,
    budget: mission.budget,
    budgetCurrency: mission.budgetCurrency,
    acceptanceCriteria: mission.acceptanceCriteria.slice(),
    toolScopes: task.toolScopes.slice()
  };
  let called = false;
  const executor = executorApi.createExecutor(async () => {
    called = true;
    return { output: "Done", evidence: ["artifact://work"] };
  }, { estimatedCost: 5 });
  await assert.rejects(executor(task, context), /Action exceeds the remaining mission budget/);
  assert.equal(called, false);
});

test("a throwing host fails the task with the original message preserved", async () => {
  const mission = runningMission([{ id: "work", title: "Do work" }], { budget: 10 });
  const executor = executorApi.createExecutor(async () => {
    throw new Error("provider exploded: quota exhausted");
  });
  const result = await core.runMissionWave(mission, executor);
  assert.deepEqual(result.completed, []);
  assert.deepEqual(result.failed, ["work"]);
  assert.equal(result.mission.tasks[0].status, "failed");
  assert.match(result.mission.tasks[0].error, /provider exploded: quota exhausted/);
});

test("a parallel wave records correct completed and failed ids for mixed outcomes", async () => {
  const mission = runningMission([
    { id: "ok-a", title: "Work A" },
    { id: "bad", title: "Work B" },
    { id: "ok-b", title: "Work C" }
  ], { budget: 10 });
  const executor = executorApi.createExecutor(async (task) => {
    if (task.id === "bad") throw new Error("bad task could not be completed");
    return { output: task.title + " finished", evidence: ["artifact://" + task.id], cost: 1 };
  });
  const result = await core.runMissionWave(mission, executor, { maxParallelism: 3 });
  assert.deepEqual(result.started, ["ok-a", "bad", "ok-b"]);
  assert.deepEqual(result.completed, ["ok-a", "ok-b"]);
  assert.deepEqual(result.failed, ["bad"]);
  const byId = new Map(result.mission.tasks.map((task) => [task.id, task]));
  assert.equal(byId.get("ok-a").status, "completed");
  assert.equal(byId.get("ok-b").status, "completed");
  assert.equal(byId.get("bad").status, "failed");
  assert.match(byId.get("bad").error, /bad task could not be completed/);
});
