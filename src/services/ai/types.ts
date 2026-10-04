export type AIProvider = "chatgpt" | "claude" | "gemini" | "copilot";

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompletionResult = {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  model: string;
};

export interface ProviderAdapter {
  readonly provider: AIProvider;
  readonly displayName: string;
  readonly model: string;
  complete(messages: AIMessage[]): Promise<AICompletionResult>;
  stream(
    messages: AIMessage[],
    onDelta: (chunk: string) => void,
  ): Promise<AICompletionResult>;
}
