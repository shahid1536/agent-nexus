import { LovableGatewayAdapter } from "./base";
import type { AIProvider } from "../types";

export class GeminiAdapter extends LovableGatewayAdapter {
  readonly provider: AIProvider = "gemini";
  readonly displayName = "Gemini";
  readonly model = "google/gemini-3-flash-preview";
}
