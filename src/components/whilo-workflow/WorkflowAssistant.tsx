import { CornerDownLeft, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { api } from "@/state/api";
import { runtimeCapabilities } from "@/lib/runtime-capability";
import { whiloText } from "@/lib/whilo-workflow-text";
import { applyAssistantOps, parseAssistantOps, workflowOutline, type AssistantOp } from "@/lib/whilo-workflow-diagram";
import type { Workflow, WorkflowMessage } from "@/lib/whilo-workflow-model";

export interface WorkflowAssistantProps {
  workflow: Workflow;
  agentId: string | undefined;
  agentName: string | undefined;
  onApply: (ops: AssistantOp[], reply: string, changes: string[]) => void;
  className?: string;
}

export function WorkflowAssistant({ workflow, agentId, agentName, onApply, className }: WorkflowAssistantProps) {
  const [messages, setMessages] = useState<WorkflowMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const capabilities = runtimeCapabilities();

  useEffect(() => {
    setMessages([]);
    setDraft("");
  }, [agentId]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
  }, []);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    setMessages((current) => [...current, { id: `u-${Date.now()}`, author: "user", text, createdAt: new Date().toISOString() }]);
    setBusy(true);
    try {
      const answer = await api<{ reply?: string; text?: string; ops?: AssistantOp[] }>("/api/whilo/board/assist", {
        method: "POST",
        body: JSON.stringify({ board: workflowOutline(workflow), request: text }),
      });
      const reply = answer.reply ?? answer.text ?? "";
      const ops = answer.ops && answer.ops.length > 0 ? answer.ops : parseAssistantOps(reply);
      const applied = ops.length > 0 ? applyAssistantOps(workflow, ops) : { changes: [] };
      const changes = applied.changes.length > 0 ? applied.changes : undefined;
      if (changes) onApply(ops, reply, changes);
      const spoken =
        reply ||
        (changes ? whiloText("whiloWorkflow.assistantApplied", { count: changes.length }) : whiloText("whiloWorkflow.assistantApplied", { count: 0 }));
      setMessages((current) => [...current, { id: `a-${Date.now()}`, author: "agent", text: spoken, changes, createdAt: new Date().toISOString() }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          author: "agent",
          text: capabilities.isDesktop ? whiloText("whiloWorkflow.assistantUnavailable") : whiloText("whiloWorkflow.assistantNoHelper"),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
      scrollToEnd();
    }
  }, [busy, capabilities.isDesktop, draft, onApply, scrollToEnd, workflow]);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  return (
    <aside
      aria-label={whiloText("whiloWorkflow.assistant")}
      className={cn("flex w-[320px] shrink-0 flex-col border-l border-hairline/40 bg-panel", className)}
    >
      <header className="flex items-center gap-2 border-b border-hairline/40 px-4 py-3">
        <Sparkles size={16} className="text-accent" />
        <h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
          {agentName ? t("automations.title") + " · " + agentName : whiloText("whiloWorkflow.assistant")}
        </h2>
      </header>
      <div ref={listRef} role="log" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <p className="text-[12.5px] leading-relaxed text-ink-secondary">{whiloText("whiloWorkflow.assistantHint")}</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-xl px-3 py-2 text-[12.5px] leading-relaxed",
              message.author === "user" ? "ml-auto max-w-[85%] bg-accent/15 text-ink" : "max-w-[92%] bg-raised text-ink",
            )}
          >
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.changes && message.changes.length > 0 && (
              <ul className="mt-2 grid gap-1" aria-label={whiloText("whiloWorkflow.assistantEdits")}>
                {message.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-1.5 text-[11.5px] text-ink-secondary">
                    <Sparkles size={11} className="mt-[3px] shrink-0 text-success" aria-hidden />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-[12px] text-ink-secondary">
            <Loader2 size={13} className="animate-spin" />
            {whiloText("whiloWorkflow.assistantThinking")}
          </div>
        )}
      </div>
      <form
        className="border-t border-hairline/40 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <div className="flex items-end gap-2 rounded-xl border border-hairline/50 bg-inset px-3 py-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder={whiloText("whiloWorkflow.assistantPlaceholder")}
            aria-label={whiloText("whiloWorkflow.assistantPlaceholder")}
            className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-tertiary"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label={whiloText("whiloWorkflow.assistantSend")}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink disabled:opacity-40"
          >
            <CornerDownLeft size={14} />
          </button>
        </div>
      </form>
    </aside>
  );
}
