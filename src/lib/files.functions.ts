import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "project-files";

export const listFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ projectId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("project_files")
      .select("*")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

/** Create a signed upload URL; the browser PUTs the file directly to Storage. */
export const createUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ projectId: z.string().uuid(), filename: z.string().min(1).max(255) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const safe = data.filename.replace(/[^\w.\-]+/g, "_");
    const path = `${data.projectId}/${Date.now()}_${safe}`;
    const { data: signed, error } = await context.supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

/** Register a completed upload in the metadata table. */
export const registerFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        projectId: z.string().uuid(),
        name: z.string().min(1),
        storagePath: z.string().min(1),
        mimeType: z.string().optional(),
        sizeBytes: z.number().int().nonnegative().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("project_files")
      .insert({
        project_id: data.projectId,
        owner_id: context.userId,
        name: data.name,
        storage_path: data.storagePath,
        mime_type: data.mimeType ?? null,
        size_bytes: data.sizeBytes ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("analytics_events").insert({
      project_id: data.projectId,
      owner_id: context.userId,
      kind: "file_upload",
      metadata: { name: data.name, size: data.sizeBytes ?? null },
    });
    return row;
  });

export const deleteFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: file, error: fErr } = await context.supabase
      .from("project_files")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (fErr) throw new Error(fErr.message);
    if (!file) return { ok: true };
    await context.supabase.storage.from(BUCKET).remove([file.storage_path]);
    const { error } = await context.supabase.from("project_files").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
