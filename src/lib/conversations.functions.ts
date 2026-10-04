import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const providerSchema = z.enum(["chatgpt", "claude", "gemini", "copilot"]);

/** Get-or-create a conversation for the given (project, provider). */
export const ensureConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ projectId: z.string().uuid(), provider: providerSchema }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const existing = await context.supabase
      .from("conversations")
      .select("*")
      .eq("project_id", data.projectId)
      .eq("provider", data.provider)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) return existing.data;

    const { data: created, error } = await context.supabase
      .from("conversations")
      .insert({
        project_id: data.projectId,
        owner_id: context.userId,
        provider: data.provider,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ projectId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("conversations")
      .select("*")
      .eq("project_id", data.projectId);
    if (error) throw new Error(error.message);
    return rows;
  });
