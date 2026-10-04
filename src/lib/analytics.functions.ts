import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProjectAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ projectId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: events, error } = await context.supabase
      .from("analytics_events")
      .select("provider,kind,tokens_input,tokens_output,latency_ms,created_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    type Row = { messages: number; tokensIn: number; tokensOut: number; latencySum: number; latencyCount: number };
    const byProvider: Record<string, Row> = {};
    let handoffs = 0;
    let fileUploads = 0;

    for (const e of events ?? []) {
      if (e.kind === "handoff") handoffs++;
      if (e.kind === "file_upload") fileUploads++;
      const key = e.provider ?? "none";
      const row = (byProvider[key] ??= {
        messages: 0,
        tokensIn: 0,
        tokensOut: 0,
        latencySum: 0,
        latencyCount: 0,
      });
      if (e.kind === "message" || e.kind === "handoff") row.messages++;
      row.tokensIn += e.tokens_input ?? 0;
      row.tokensOut += e.tokens_output ?? 0;
      if (e.latency_ms) {
        row.latencySum += e.latency_ms;
        row.latencyCount++;
      }
    }

    return {
      totals: {
        events: events?.length ?? 0,
        handoffs,
        fileUploads,
        tokensIn: Object.values(byProvider).reduce((s, r) => s + r.tokensIn, 0),
        tokensOut: Object.values(byProvider).reduce((s, r) => s + r.tokensOut, 0),
      },
      byProvider: Object.entries(byProvider).map(([provider, r]) => ({
        provider,
        messages: r.messages,
        tokensIn: r.tokensIn,
        tokensOut: r.tokensOut,
        avgLatencyMs: r.latencyCount ? Math.round(r.latencySum / r.latencyCount) : 0,
      })),
      recent: (events ?? []).slice(0, 25),
    };
  });
