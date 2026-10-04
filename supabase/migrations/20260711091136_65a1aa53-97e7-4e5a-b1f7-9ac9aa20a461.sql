
-- Enable pgvector for semantic memory
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================
-- Roles (user_roles)
-- =========================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =========================
-- Project members (collaboration)
-- =========================
DO $$ BEGIN
  CREATE TYPE public.member_role AS ENUM ('owner', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.member_role NOT NULL DEFAULT 'viewer',
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = _project_id AND p.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.project_members m WHERE m.project_id = _project_id AND m.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_project(_project_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = _project_id AND p.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.project_members m
    WHERE m.project_id = _project_id AND m.user_id = _user_id AND m.role IN ('owner','editor')
  );
$$;

DROP POLICY IF EXISTS project_members_read ON public.project_members;
CREATE POLICY project_members_read ON public.project_members
  FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS project_members_write ON public.project_members;
CREATE POLICY project_members_write ON public.project_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));

-- =========================
-- Handoffs (cross-provider transfers)
-- =========================
CREATE TABLE IF NOT EXISTS public.handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_provider text NOT NULL,
  target_provider text NOT NULL,
  source_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  target_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  source_conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  target_conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  included_memory_ids uuid[] NOT NULL DEFAULT '{}',
  included_file_ids uuid[] NOT NULL DEFAULT '{}',
  extra_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoffs TO authenticated;
GRANT ALL ON public.handoffs TO service_role;
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS handoffs_owner_all ON public.handoffs;
CREATE POLICY handoffs_owner_all ON public.handoffs
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE INDEX IF NOT EXISTS handoffs_project_idx ON public.handoffs(project_id, created_at DESC);

-- =========================
-- Memory embeddings (pgvector) — semantic search over project memory
-- =========================
CREATE TABLE IF NOT EXISTS public.memory_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES public.project_memory(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_embeddings TO authenticated;
GRANT ALL ON public.memory_embeddings TO service_role;
ALTER TABLE public.memory_embeddings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS memory_embeddings_owner_all ON public.memory_embeddings;
CREATE POLICY memory_embeddings_owner_all ON public.memory_embeddings
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE INDEX IF NOT EXISTS memory_embeddings_ivf
  ON public.memory_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION public.match_project_memory(
  _project_id uuid, _query vector(1536), _limit int DEFAULT 8
) RETURNS TABLE (id uuid, memory_id uuid, content text, similarity float)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT me.id, me.memory_id, me.content,
         1 - (me.embedding <=> _query) AS similarity
  FROM public.memory_embeddings me
  WHERE me.project_id = _project_id
    AND public.is_project_member(_project_id, auth.uid())
  ORDER BY me.embedding <=> _query
  LIMIT _limit;
$$;

-- =========================
-- Message attachments (file refs linked to messages)
-- =========================
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, file_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_attachments TO authenticated;
GRANT ALL ON public.message_attachments TO service_role;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_attachments_owner_all ON public.message_attachments;
CREATE POLICY message_attachments_owner_all ON public.message_attachments
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- =========================
-- Conversation rolling summaries (context window management)
-- =========================
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text NOT NULL,
  up_to_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  tokens int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_summaries TO authenticated;
GRANT ALL ON public.conversation_summaries TO service_role;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conv_summaries_owner_all ON public.conversation_summaries;
CREATE POLICY conv_summaries_owner_all ON public.conversation_summaries
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE INDEX IF NOT EXISTS conv_summaries_conv_idx
  ON public.conversation_summaries(conversation_id, created_at DESC);

-- =========================
-- Per-project provider configuration
-- =========================
CREATE TABLE IF NOT EXISTS public.provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text,
  system_prompt text,
  temperature numeric(3,2) DEFAULT 0.7,
  max_tokens int,
  enabled boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, provider)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_configs TO authenticated;
GRANT ALL ON public.provider_configs TO service_role;
ALTER TABLE public.provider_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS provider_configs_owner_all ON public.provider_configs;
CREATE POLICY provider_configs_owner_all ON public.provider_configs
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP TRIGGER IF EXISTS provider_configs_touch ON public.provider_configs;
CREATE TRIGGER provider_configs_touch BEFORE UPDATE ON public.provider_configs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Usage daily rollup (fast analytics)
-- =========================
CREATE TABLE IF NOT EXISTS public.usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  provider text NOT NULL,
  day date NOT NULL,
  requests int NOT NULL DEFAULT 0,
  tokens_input bigint NOT NULL DEFAULT 0,
  tokens_output bigint NOT NULL DEFAULT 0,
  latency_ms_sum bigint NOT NULL DEFAULT 0,
  cost_usd numeric(12,6) NOT NULL DEFAULT 0,
  UNIQUE (owner_id, project_id, provider, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_daily TO authenticated;
GRANT ALL ON public.usage_daily TO service_role;
ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS usage_daily_owner_read ON public.usage_daily;
CREATE POLICY usage_daily_owner_read ON public.usage_daily
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- =========================
-- Tags & project_tags
-- =========================
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tags_owner_all ON public.tags;
CREATE POLICY tags_owner_all ON public.tags
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.project_tags (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, tag_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tags TO authenticated;
GRANT ALL ON public.project_tags TO service_role;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS project_tags_owner_all ON public.project_tags;
CREATE POLICY project_tags_owner_all ON public.project_tags
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- =========================
-- API keys (user-supplied provider keys — stores only vault refs / masks)
-- =========================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  label text,
  secret_ref text NOT NULL,
  last4 text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, provider, label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS api_keys_owner_all ON public.api_keys;
CREATE POLICY api_keys_owner_all ON public.api_keys
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- =========================
-- Audit logs
-- =========================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigserial PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_owner_read ON public.audit_logs;
CREATE POLICY audit_logs_owner_read ON public.audit_logs
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
DROP POLICY IF EXISTS audit_logs_owner_insert ON public.audit_logs;
CREATE POLICY audit_logs_owner_insert ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- =========================
-- Notifications
-- =========================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_owner_all ON public.notifications;
CREATE POLICY notifications_owner_all ON public.notifications
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE INDEX IF NOT EXISTS notifications_owner_created_idx
  ON public.notifications(owner_id, created_at DESC);

-- =========================
-- Helpful indexes on existing tables
-- =========================
CREATE INDEX IF NOT EXISTS messages_conv_created_idx ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS messages_project_created_idx ON public.messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_project_provider_idx ON public.conversations(project_id, provider);
CREATE INDEX IF NOT EXISTS project_memory_project_idx ON public.project_memory(project_id, pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS project_files_project_idx ON public.project_files(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_project_idx ON public.analytics_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS projects_owner_updated_idx ON public.projects(owner_id, updated_at DESC);
