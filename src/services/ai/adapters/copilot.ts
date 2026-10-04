import { LovableGatewayAdapter } from "./base";
import type { AIProvider } from "../types";

// GitHub Copilot has no public chat API; route to a fast code-focused model.
export class CopilotAdapter extends LovableGatewayAdapter {
  readonly provider: AIProvider = "copilot";
  readonly displayName = "Copilot";
  readonly model = "openai/gpt-5-nano";
}
