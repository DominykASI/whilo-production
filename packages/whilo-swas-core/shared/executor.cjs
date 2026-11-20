(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WhiloExecutor = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function cleanScopes(value) {
    const list = Array.isArray(value) ? value : [];
    return [...new Set(list.filter(x => typeof x === "string" && x.trim()).map(x => x.trim()))];
  }

  function cleanEvidence(value) {
    if (typeof value === "string") return value.trim() ? [value.trim()] : [];
    const list = Array.isArray(value) ? value : [];
    return [...new Set(list.filter(x => typeof x === "string" && x.trim()).map(x => x.trim()))];
  }

  function resolveHost(host) {
    if (!host) throw new TypeError("A host executor is required; the core bundles no provider.");
    if (typeof host === "function") return host;
    if (host && typeof host.execute === "function") {
      return function (task, context) { return host.execute(task, context); };
    }
    if (host && typeof host.run === "function") {
      return function (task, context) { return host.run(task, context); };
    }
    if (host && typeof host.delegate === "function") {
      return function (task, context) { return host.delegate(task, context); };
    }
    throw new TypeError("Host must be a function or an object with an execute(), run() or delegate() method.");
  }

  function resolveEstimatedCost(options, task, context) {
    let taskEstimate;
    if (task && typeof task === "object") {
      if (isFiniteNumber(task.estimatedCost)) taskEstimate = task.estimatedCost;
      else if (isFiniteNumber(task.costEstimate)) taskEstimate = task.costEstimate;
      else if (isFiniteNumber(task.maxCost)) taskEstimate = task.maxCost;
    }
    if (isFiniteNumber(taskEstimate) && taskEstimate >= 0) return taskEstimate;
    if (isFiniteNumber(options) && options >= 0) return options;
    if (typeof options === "function") {
      try {
        const viaFn = options(task, context);
        if (isFiniteNumber(viaFn) && viaFn >= 0) return viaFn;
      } catch (ignore) { /* fall through to the safe default below */ }
      return 0;
    }
    if (options && typeof options === "object") {
      const candidates = [options.estimatedCost, options.costEstimate, options.maxCost, options.perTaskCost, options.budgetLimit, options.estimate];
      for (let i = 0; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        if (typeof candidate === "function") {
          try {
            const valued = candidate(task, context);
            if (isFiniteNumber(valued) && valued >= 0) return valued;
          } catch (ignoreCandidate) { /* try the next candidate */ }
          continue;
        }
        if (isFiniteNumber(candidate) && candidate >= 0) return candidate;
      }
      if (typeof options.estimateCost === "function") {
        try {
          const estimated = options.estimateCost(task, context);
          if (isFiniteNumber(estimated) && estimated >= 0) return estimated;
        } catch (ignoreEstimate) { /* fall through to the safe default below */ }
      }
    }
    return 0;
  }

  function encodeResult(taskOrId, result, context) {
    let taskId = "unknown";
    if (typeof taskOrId === "string" && taskOrId.trim()) taskId = taskOrId.trim();
    else if (taskOrId && typeof taskOrId.id === "string" && taskOrId.id.trim()) taskId = taskOrId.id.trim();
    else if (taskOrId && typeof taskOrId.taskId === "string" && taskOrId.taskId.trim()) taskId = taskOrId.taskId.trim();
    const input = result && typeof result === "object" ? result : {};
    const output = typeof input.output === "string" ? input.output : "";
    const evidence = cleanEvidence(input.evidence);
    const cost = isFiniteNumber(input.cost) ? input.cost : 0;
    const durationMs = isFiniteNumber(input.durationMs) ? input.durationMs : (isFiniteNumber(input.duration) ? input.duration : 0);
    const at = new Date().toISOString();
    let missionId = null;
    if (context && typeof context.missionId === "string" && context.missionId.trim()) missionId = context.missionId.trim();
    else if (typeof input.missionId === "string" && input.missionId.trim()) missionId = input.missionId.trim();
    let budgetCurrency = "USD";
    if (context && typeof context.budgetCurrency === "string" && context.budgetCurrency.trim()) budgetCurrency = context.budgetCurrency.trim();
    else if (typeof input.budgetCurrency === "string" && input.budgetCurrency.trim()) budgetCurrency = input.budgetCurrency.trim();
    return Object.freeze({
      id: taskId,
      taskId: taskId,
      missionId: missionId,
      output: output,
      evidence: evidence,
      artifactUri: typeof input.artifactUri === "string" && input.artifactUri.trim() ? input.artifactUri.slice(0, 2000) : null,
      cost: cost,
      budgetCurrency: budgetCurrency,
      durationMs: durationMs,
      duration: durationMs,
      startedAt: typeof input.startedAt === "string" && input.startedAt.trim() ? input.startedAt : at,
      completedAt: typeof input.completedAt === "string" && input.completedAt.trim() ? input.completedAt : at
    });
  }

  function createExecutor(host, options) {
    let resolvedHost = host;
    let resolvedOptions = options;
    if (host && typeof host === "object"
      && typeof host.execute !== "function"
      && typeof host.run !== "function"
      && typeof host.delegate !== "function"
      && (host.host || host.provider || host.executor)) {
      resolvedHost = host.host || host.provider || host.executor;
      if (resolvedOptions === undefined) {
        resolvedOptions = {
          estimatedCost: host.estimatedCost,
          requiredScopes: host.requiredScopes,
          scopes: host.scopes
        };
      }
    }
    const call = resolveHost(resolvedHost);

    async function executor(task, context) {
      const startedMs = Date.now();
      const startedAt = new Date(startedMs).toISOString();
      let taskId = "unknown";
      if (task && typeof task.id === "string" && task.id.trim()) taskId = task.id.trim();

      let required = [];
      if (resolvedOptions && Array.isArray(resolvedOptions.requiredScopes)) required = cleanScopes(resolvedOptions.requiredScopes);
      else if (resolvedOptions && Array.isArray(resolvedOptions.scopes)) required = cleanScopes(resolvedOptions.scopes);
      else if (task && Array.isArray(task.toolScopes)) required = cleanScopes(task.toolScopes);

      const granted = context && Array.isArray(context.toolScopes) ? cleanScopes(context.toolScopes) : [];
      if (!granted.length) {
        throw new Error("Missing required capability scopes: " + (required.length ? required.join(", ") : "none declared"));
      }
      const missing = required.filter(function (scope) { return granted.indexOf(scope) === -1; });
      if (missing.length) {
        throw new Error("Missing required capability scopes: " + missing.join(", "));
      }

      const budget = context && isFiniteNumber(context.budget) && context.budget >= 0 ? context.budget : 0;
      const estimatedCost = resolveEstimatedCost(resolvedOptions, task, context);
      if (isFiniteNumber(estimatedCost) && estimatedCost > budget) {
        throw new Error("Action exceeds the remaining mission budget (" + estimatedCost + " > " + budget + ")");
      }

      let raw;
      try {
        raw = await call(task, context);
      } catch (error) {
        if (error && error.message) throw error;
        throw new Error("Host executor failed without a diagnostic.");
      }

      const durationMs = Date.now() - startedMs;
      const completedAt = new Date().toISOString();

      let output = "";
      let evidence = [];
      let artifactUri = null;
      let cost = estimatedCost;
      if (typeof raw === "string") {
        output = raw;
      } else if (raw && typeof raw === "object") {
        if (typeof raw.output === "string") output = raw.output;
        if (Array.isArray(raw.evidence)) evidence = cleanEvidence(raw.evidence);
        else if (typeof raw.evidence === "string" && raw.evidence.trim()) evidence = [raw.evidence.trim()];
        if (typeof raw.artifactUri === "string" && raw.artifactUri.trim()) artifactUri = raw.artifactUri.slice(0, 2000);
        if (isFiniteNumber(raw.cost) && raw.cost >= 0) cost = raw.cost;
        else if (isFiniteNumber(raw.estimatedCost) && raw.estimatedCost >= 0) cost = raw.estimatedCost;
      }

      if (isFiniteNumber(cost) && cost > budget) {
        throw new Error("Action exceeds the remaining mission budget (" + cost + " > " + budget + ")");
      }

      const record = encodeResult(task, {
        output: output,
        evidence: evidence,
        artifactUri: artifactUri,
        cost: cost,
        durationMs: durationMs,
        startedAt: startedAt,
        completedAt: completedAt,
        missionId: context && context.missionId,
        budgetCurrency: context && context.budgetCurrency
      }, context);

      return {
        output: record.output,
        evidence: record.evidence,
        artifactUri: record.artifactUri,
        id: record.id,
        taskId: record.taskId,
        missionId: record.missionId,
        cost: record.cost,
        durationMs: record.durationMs,
        duration: record.durationMs,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
        budgetCurrency: record.budgetCurrency
      };
    }

    executor.encodeResult = encodeResult;
    return executor;
  }

  return Object.freeze({
    createExecutor,
    createExecutorAdapter: createExecutor,
    encodeResult,
    encodeExecutionRecord: encodeResult
  });
});
