
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage RLS: users can only touch objects under path "{project_id}/..." for projects they own.
CREATE POLICY "project_files_owner_select" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-files' AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);
CREATE POLICY "project_files_owner_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-files' AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);
CREATE POLICY "project_files_owner_delete" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-files' AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);
