import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AIManager } from "@/services/ai/manager";
import type { AIMessage, AIProvider } from "@/services/ai/types";

const providerSchema = z.enum(["chatgpt", "claude", "gemini", "copilot"]);

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ conversationId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows;
  });

/**
 * Send a user message to a provider and get back an assistant reply.
 * - persists user + assistant messages
 * - loads pinned shared memory from the project as system context
 * - records an analytics event
 * - if `handoffFrom` is set, seeds the user turn as a hand-off from another provider
 */
export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        projectId: z.string().uuid(),
        conversationId: z.string().uuid(),
        provider: providerSchema,
        content: z.string().min(1).max(20000),
        handoffFrom: providerSchema.optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Insert the user message first so history is consistent even if AI fails.
    const { data: userMsg, error: userErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        project_id: data.projectId,
        owner_id: userId,
        provider: data.provider,
        role: "user",
        content: data.content,
        handoff_from: data.handoffFrom ?? null,
      })
      .select()
      .single();
    if (userErr) throw new Error(userErr.message);

    // Build the model context: pinned project memory + full conversation.
    const [memoryRes, historyRes, projectRes] = await Promise.all([
      supabase
        .from("project_memory")
        .select("title,content,source")
        .eq("project_id", data.projectId)
        .eq("pinned", true)
        .order("created_at", { ascending: true })
        .limit(20),
      supabase
        .from("messages")
        .select("role,content")
        .eq("conversation_id", data.conversationId)
        .order("created_at", { ascending: true })
        .limit(100),
      supabase.from("projects").select("title,description").eq("id", data.projectId).maybeSingle(),
    ]);
    if (memoryRes.error) throw new Error(memoryRes.error.message);
    if (historyRes.error) throw new Error(historyRes.error.message);

    const memoryBlock = (memoryRes.data ?? [])
      .map((m) => `# ${m.title}${m.source ? ` (from ${m.source})` : ""}\n${m.content}`)
      .join("\n\n");

    const adapter = AIManager.get(data.provider as AIProvider);
    const systemPrompt = [
      `You are ${adapter.displayName}, collaborating inside the Agent Nexus workspace.`,
      projectRes.data
        ? `Project: "${projectRes.data.title}"${projectRes.data.description ? ` — ${projectRes.data.description}` : ""}`
        : "",
      memoryBlock ? `Shared project memory (pinned):\n${memoryBlock}` : "",
      data.handoffFrom
        ? `The most recent user turn is a hand-off from ${data.handoffFrom}. Continue the collaboration.`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const modelMessages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...(historyRes.data ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    let completion;
    try {
      completion = await adapter.complete(modelMessages);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Persist an error assistant message so the UI can show it.
      await supabase.from("messages").insert({
        conversation_id: data.conversationId,
        project_id: data.projectId,
        owner_id: userId,
        provider: data.provider,
        role: "assistant",
        content: `⚠️ ${adapter.displayName} failed: ${message}`,
        metadata: { error: true },
      });
      throw new Error(message);
    }

    const { data: assistantMsg, error: aErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        project_id: data.projectId,
        owner_id: userId,
        provider: data.provider,
        role: "assistant",
        content: completion.text,
        tokens_input: completion.tokensInput,
        tokens_output: completion.tokensOutput,
        latency_ms: completion.latencyMs,
        metadata: { model: completion.model },
      })
      .select()
      .single();
    if (aErr) throw new Error(aErr.message);

    await supabase.from("analytics_events").insert({
      project_id: data.projectId,
      owner_id: userId,
      provider: data.provider,
      kind: data.handoffFrom ? "handoff" : "message",
      tokens_input: completion.tokensInput,
      tokens_output: completion.tokensOutput,
      latency_ms: completion.latencyMs,
      metadata: { model: completion.model, handoff_from: data.handoffFrom ?? null },
    });

    // Bump conversation updated_at.
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.conversationId);

    return { userMessage: userMsg, assistantMessage: assistantMsg };
  });

/**
 * Hand off the last assistant message from one provider's conversation to
 * another provider's conversation in the same project. Creates the target
 * conversation if missing, then sends the seeded prompt.
 */
export const handoffMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        projectId: z.string().uuid(),
        sourceMessageId: z.string().uuid(),
        targetProvider: providerSchema,
        prefix: z.string().max(500).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: source, error: sErr } = await supabase
      .from("messages")
      .select("provider,content")
      .eq("id", data.sourceMessageId)
      .maybeSingle();
    if (sErr) throw new Error(sErr.message);
    if (!source) throw new Error("Source message not found");

    // Ensure target conversation exists.
    let target = await supabase
      .from("conversations")
      .select("*")
      .eq("project_id", data.projectId)
      .eq("provider", data.targetProvider)
      .maybeSingle();
    if (target.error) throw new Error(target.error.message);
    if (!target.data) {
      const created = await supabase
        .from("conversations")
        .insert({
          project_id: data.projectId,
          owner_id: userId,
          provider: data.targetProvider,
        })
        .select()
        .single();
      if (created.error) throw new Error(created.error.message);
      target = { ...target, data: created.data, error: null };
    }

    const prefix =
      data.prefix ??
      `Context from ${source.provider}. Please review, extend, or critique:`;
    const seeded = `${prefix}\n\n---\n${source.content}`;

    // Reuse sendMessage via direct handler emulation to keep single code path.
    const { error: insertErr, data: userMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: target.data!.id,
        project_id: data.projectId,
        owner_id: userId,
        provider: data.targetProvider,
        role: "user",
        content: seeded,
        handoff_from: source.provider,
      })
      .select()
      .single();
    if (insertErr) throw new Error(insertErr.message);

    return { conversationId: target.data!.id, userMessage: userMsg };
  });
