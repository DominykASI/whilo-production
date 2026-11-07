// Slug to guide body, on the same terms as the news bodies: eager, so the prose
// is in the server's HTML rather than arriving after hydration.

import type { ArticleBody } from "../body";
import { AgenticAIDefinition } from "./agentic-ai-definition";
import { AIAgentsExamples } from "./ai-agents-examples";
import { AIAgentsVsAgenticAI } from "./ai-agents-vs-agentic-ai";
import { ImportGrokBotAgents } from "./import-grok-bot-agents";
import { ImportHermesAgents } from "./import-hermes-agents";
import { InstallWhiloVPS } from "./install-whilo-vps";
import { Whilo101 } from "./whilo-101";
import { WhiloHostedServers } from "./whilo-hosted-servers";
import { WhiloMarketplace } from "./whilo-marketplace";
import { WhatAreAIAgents } from "./what-are-ai-agents";
import { WtfIsWhilo } from "./wtf-is-whilo";

export const GUIDE_BODIES: Readonly<Record<string, ArticleBody>> = {
  "install-whilo-vps": InstallWhiloVPS,
  "import-hermes-agents": ImportHermesAgents,
  "import-grok-bot-agents": ImportGrokBotAgents,
  "ai-agents-examples": AIAgentsExamples,
  "ai-agents-vs-agentic-ai": AIAgentsVsAgenticAI,
  "agentic-ai-definition": AgenticAIDefinition,
  "what-are-ai-agents": WhatAreAIAgents,
  "whilo-101": Whilo101,
  "whilo-hosted-servers": WhiloHostedServers,
  "whilo-marketplace": WhiloMarketplace,
  "wtf-is-whilo": WtfIsWhilo,
};
