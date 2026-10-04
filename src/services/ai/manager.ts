import type { AIProvider, ProviderAdapter } from "./types";
import { ChatGPTAdapter } from "./adapters/chatgpt";
import { ClaudeAdapter } from "./adapters/claude";
import { GeminiAdapter } from "./adapters/gemini";
import { CopilotAdapter } from "./adapters/copilot";

/**
 * AIManager — single entry point for provider access. Uses the Adapter pattern
 * so upstream services never depend on a specific vendor.
 */
class AIManagerImpl {
  private adapters: Record<AIProvider, ProviderAdapter> = {
    chatgpt: new ChatGPTAdapter(),
    claude: new ClaudeAdapter(),
    gemini: new GeminiAdapter(),
    copilot: new CopilotAdapter(),
  };

  get(provider: AIProvider): ProviderAdapter {
    const adapter = this.adapters[provider];
    if (!adapter) throw new Error(`Unknown provider: ${provider}`);
    return adapter;
  }

  list(): ProviderAdapter[] {
    return Object.values(this.adapters);
  }
}

export const AIManager = new AIManagerImpl();
