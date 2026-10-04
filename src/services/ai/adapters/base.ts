import { generateText, streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { AIMessage, AICompletionResult, AIProvider, ProviderAdapter } from "../types";

/**
 * Base adapter for any model reachable through Lovable AI Gateway.
 * Concrete adapters (ChatGPTAdapter, ClaudeAdapter, GeminiAdapter) only pick a
 * model id — the transport, streaming, and telemetry pipeline is shared.
 */
export abstract class LovableGatewayAdapter implements ProviderAdapter {
  abstract readonly provider: AIProvider;
  abstract readonly displayName: string;
  abstract readonly model: string;

  private modelFor() {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
    const gateway = createLovableAiGatewayProvider(apiKey);
    return gateway(this.model);
  }

  async complete(messages: AIMessage[]): Promise<AICompletionResult> {
    const start = Date.now();
    const result = await generateText({ model: this.modelFor(), messages });
    return {
      text: result.text,
      tokensInput: result.usage?.inputTokens ?? 0,
      tokensOutput: result.usage?.outputTokens ?? 0,
      latencyMs: Date.now() - start,
      model: this.model,
    };
  }

  async stream(
    messages: AIMessage[],
    onDelta: (chunk: string) => void,
  ): Promise<AICompletionResult> {
    const start = Date.now();
    const result = streamText({ model: this.modelFor(), messages });
    let text = "";
    for await (const delta of result.textStream) {
      text += delta;
      onDelta(delta);
    }
    const usage = await result.usage;
    return {
      text,
      tokensInput: usage?.inputTokens ?? 0,
      tokensOutput: usage?.outputTokens ?? 0,
      latencyMs: Date.now() - start,
      model: this.model,
    };
  }
}
