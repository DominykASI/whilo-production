// The board assistant: the endpoint behind Whilo Whiteboard's AI panel. A person asks for a change in
// words; this turns the board and the request into a short list of operations the canvas applies.
// It reuses the decision/extraction accounts (OpenRouter chat), so it needs no key of its own and
// never sends a key anywhere the accounts module would refuse. Every failure is a plain message,
// never a stack, and a board with no helper configured still answers with a straight explanation.
import { z } from "zod";

import type { AppConfig } from "../config.ts";
import { openrouterAccount } from "../decider/accounts.ts";
import { openrouterEndpoint } from "../decider/openrouter.ts";
import { PASS, type RouteHandler } from "./table.ts";

export interface WhiloBoardRouteDeps {
  config(): AppConfig;
}

const NODE_KINDS = ["note", "text", "shape", "frame", "prompt", "agent", "llm", "output", "condition", "image", "data"] as const;

const opSchema = z.object({
  op: z.enum(["add", "update", "remove", "connect"]),
  id: z.string().max(120).optional(),
  kind: z.enum(NODE_KINDS).optional(),
  title: z.string().max(2_000).optional(),
  text: z.string().max(20_000).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  from: z.string().max(120).optional(),
  to: z.string().max(120).optional(),
}).strict();

const bodySchema = z.object({
  board: z.string().max(120_000),
  request: z.string().trim().min(1).max(4_000),
}).strict();

const MAX_OPS = 40;
const TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = [
  "You edit a node board for a person. The board is given as an outline; each line is `- [id] kind: title` and a",
  "connection is `source -> target`.",
  "Answer with JSON only: {\"reply\": string, \"ops\": Op[]}. Op is one of:",
  "  {\"op\":\"add\",\"kind\":one of note|text|shape|frame|prompt|agent|llm|output|condition|image|data,\"title\":string,\"text\":string,\"x\":number,\"y\":number}",
  "  {\"op\":\"update\",\"id\":string,\"title\":string,\"text\":string}",
  "  {\"op\":\"remove\",\"id\":string}",
  "  {\"op\":\"connect\",\"from\":string,\"to\":string}",
  "Use at most 40 ops. `reply` is one short sentence for the person. Never invent ids that are not in the board.",
].join("\n");

function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function whiloBoardOpsFromAnswer(answer: unknown): { reply: string; ops: unknown[] } {
  if (!answer || typeof answer !== "object") return { reply: "", ops: [] };
  const record = answer as { reply?: unknown; ops?: unknown };
  const reply = typeof record.reply === "string" ? record.reply : "";
  const raw = Array.isArray(record.ops) ? record.ops : [];
  const ops: unknown[] = [];
  for (const candidate of raw.slice(0, MAX_OPS)) {
    const parsed = opSchema.safeParse(candidate);
    if (parsed.success) ops.push(parsed.data);
  }
  return { reply, ops };
}

export function createWhiloBoardRoutes(deps: WhiloBoardRouteDeps): RouteHandler {
  return async ({ req, res, path, method, json, readBody }) => {
    if (path !== "/api/whilo/board/assist" || method !== "POST") return PASS;
    const body = bodySchema.safeParse(await readBody(req, 160_000));
    if (!body.success) return json(res, 400, { error: "board and request are required." });
    const cfg = deps.config();
    const account = openrouterAccount(cfg);
    if (!account) {
      return json(res, 200, {
        reply: "No helper model is set up on this computer. Add an OpenRouter key in Settings → API keys, or edit the board by hand.",
        ops: [],
      });
    }
    const endpoint = openrouterEndpoint(account.api);
    if (!endpoint) return json(res, 200, { reply: "The helper model's address is not usable.", ops: [] });
    const model = cfg.decider?.openrouterModel?.trim() || "openai/gpt-4o-mini";
    let reply = "";
    let ops: unknown[] = [];
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${account.token}`,
          "content-type": "application/json",
          accept: "application/json",
          "x-openrouter-title": "Whilo Pets",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 2_048,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Board:\n${body.data.board}\n\nRequest: ${body.data.request}` },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "error",
      });
      if (!response.ok) {
        await response.body?.cancel().catch(() => undefined);
        return json(res, 200, { reply: "The helper model refused the request. Try again, or edit the board by hand.", ops: [] });
      }
      const answer = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
      const content = answer.choices?.[0]?.message?.content;
      const parsed = whiloBoardOpsFromAnswer(typeof content === "string" ? extractJson(content) : null);
      reply = parsed.reply;
      ops = parsed.ops;
    } catch {
      return json(res, 200, { reply: "The helper model could not be reached. Try again shortly.", ops: [] });
    }
    if (!reply && ops.length === 0) reply = "No change was needed.";
    return json(res, 200, { reply, ops });
  };
}
