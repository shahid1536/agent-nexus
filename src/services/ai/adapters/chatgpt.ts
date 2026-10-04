import { LovableGatewayAdapter } from "./base";
import type { AIProvider } from "../types";

export class ChatGPTAdapter extends LovableGatewayAdapter {
  readonly provider: AIProvider = "chatgpt";
  readonly displayName = "ChatGPT";
  readonly model = "openai/gpt-5-mini";
}
