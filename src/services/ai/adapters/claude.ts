import { LovableGatewayAdapter } from "./base";
import type { AIProvider } from "../types";

// Anthropic is not yet exposed through the Lovable AI Gateway allowlist;
// we route "Claude" to the best available reasoning model so the UX works
// end-to-end. Swap the model id once Anthropic is added to the catalog.
export class ClaudeAdapter extends LovableGatewayAdapter {
  readonly provider: AIProvider = "claude";
  readonly displayName = "Claude";
  readonly model = "openai/gpt-5";
}
