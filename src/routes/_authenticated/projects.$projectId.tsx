import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProject } from "@/lib/projects.functions";
import { ensureConversation } from "@/lib/conversations.functions";
import { listMessages, sendMessage, handoffMessage } from "@/lib/messages.functions";
import { listMemory, createMemory, togglePinMemory, deleteMemory } from "@/lib/memory.functions";
import { listFiles, createUploadUrl, registerFile, deleteFile } from "@/lib/files.functions";
import { getProjectAnalytics } from "@/lib/analytics.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Sparkles, Send, Pin, PinOff, Trash2, Upload, Brain, FileText, BarChart3,
  MessageSquare, ArrowRightCircle, Loader2, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: WorkspacePage,
});

type Provider = "chatgpt" | "claude" | "gemini" | "copilot";

const PROVIDERS: { id: Provider; name: string; color: string; accent: string }[] = [
  { id: "chatgpt", name: "ChatGPT", color: "#10A37F", accent: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "claude", name: "Claude", color: "#D97757", accent: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { id: "gemini", name: "Gemini", color: "#4285F4", accent: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { id: "copilot", name: "Copilot", color: "#8B5CF6", accent: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
];

function WorkspacePage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const getProjectFn = useServerFn(getProject);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectFn({ data: { id: projectId } }),
  });

  const [tab, setTab] = useState<"chat" | "memory" | "files" | "analytics">("chat");
  const [provider, setProvider] = useState<Provider>("chatgpt");

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      <header className="border-b border-white/10 bg-[#18181B]/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/projects" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{project?.title ?? "Loading…"}</div>
              {project?.description && <div className="text-xs text-white/50 truncate">{project.description}</div>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-white/70">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-[#0f0f12]">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="bg-transparent h-12 p-0 gap-1">
              <TabsTrigger value="chat" className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-white/60 rounded-md gap-2">
                <MessageSquare className="w-4 h-4" /> Chat
              </TabsTrigger>
              <TabsTrigger value="memory" className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-white/60 rounded-md gap-2">
                <Brain className="w-4 h-4" /> Shared memory
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-white/60 rounded-md gap-2">
                <FileText className="w-4 h-4" /> Files
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-white/60 rounded-md gap-2">
                <BarChart3 className="w-4 h-4" /> Analytics
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="chat" className="flex-1 m-0">
          <ChatPanel projectId={projectId} provider={provider} setProvider={setProvider} />
        </TabsContent>
        <TabsContent value="memory" className="flex-1 m-0">
          <MemoryPanel projectId={projectId} />
        </TabsContent>
        <TabsContent value="files" className="flex-1 m-0">
          <FilesPanel projectId={projectId} />
        </TabsContent>
        <TabsContent value="analytics" className="flex-1 m-0">
          <AnalyticsPanel projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Chat ---------------- */

function ChatPanel({
  projectId, provider, setProvider,
}: { projectId: string; provider: Provider; setProvider: (p: Provider) => void }) {
  const qc = useQueryClient();
  const ensureFn = useServerFn(ensureConversation);
  const listFn = useServerFn(listMessages);
  const sendFn = useServerFn(sendMessage);
  const handoffFn = useServerFn(handoffMessage);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", projectId, provider],
    queryFn: () => ensureFn({ data: { projectId, provider } }),
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", conversation?.id],
    queryFn: () => listFn({ data: { conversationId: conversation!.id } }),
    enabled: !!conversation?.id,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const [input, setInput] = useState("");
  const send = useMutation({
    mutationFn: (content: string) =>
      sendFn({ data: { projectId, conversationId: conversation!.id, provider, content } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversation?.id] });
      setInput("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Send failed"),
  });

  const handoff = useMutation({
    mutationFn: (input: { sourceMessageId: string; targetProvider: Provider }) =>
      handoffFn({
        data: {
          projectId,
          sourceMessageId: input.sourceMessageId,
          targetProvider: input.targetProvider,
        },
      }),
    onSuccess: (_data, vars) => {
      toast.success(`Handed off to ${vars.targetProvider}`);
      setProvider(vars.targetProvider);
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Handoff failed"),
  });

  const currentMeta = PROVIDERS.find((p) => p.id === provider)!;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col h-[calc(100vh-9rem)]">
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap",
              provider === p.id
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20",
            )}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ backgroundColor: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {!messages || messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-white/40">
            <div>
              <MessageSquare className="w-10 h-10 mx-auto mb-3" />
              <div className="font-medium text-white/70">Start the conversation with {currentMeta.name}</div>
              <div className="text-sm mt-1">Pinned shared memory and prior turns are sent automatically.</div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onHandoff={(target) =>
                handoff.mutate({ sourceMessageId: m.id, targetProvider: target })
              }
              handoffPending={handoff.isPending}
            />
          ))
        )}
        {send.isPending && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> {currentMeta.name} is thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || !conversation) return;
          send.mutate(input.trim());
        }}
        className="mt-4 rounded-xl border border-white/10 bg-[#18181B] p-3 flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && conversation && !send.isPending) send.mutate(input.trim());
            }
          }}
          placeholder={`Message ${currentMeta.name}…`}
          className="bg-transparent border-0 focus-visible:ring-0 resize-none min-h-[52px] max-h-40 text-white placeholder:text-white/40"
        />
        <Button
          type="submit"
          disabled={!input.trim() || send.isPending || !conversation}
          className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({
  message, onHandoff, handoffPending,
}: {
  message: {
    id: string; role: string; content: string; provider: Provider;
    handoff_from: string | null; tokens_output: number; latency_ms: number | null;
  };
  onHandoff: (target: Provider) => void;
  handoffPending: boolean;
}) {
  const isUser = message.role === "user";
  const meta = PROVIDERS.find((p) => p.id === message.provider)!;
  const [showHandoff, setShowHandoff] = useState(false);

  return (
    <div className={cn("group", isUser ? "flex justify-end" : "flex justify-start")}>
      <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 border", isUser
        ? "bg-white/5 border-white/10"
        : "bg-[#18181B] border-white/10")}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-white/70 font-medium">{meta.name}</span>
            {message.latency_ms != null && <span className="text-white/40">{message.latency_ms}ms</span>}
            {message.tokens_output > 0 && <span className="text-white/40">{message.tokens_output} tok</span>}
          </div>
        )}
        {message.handoff_from && (
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
            Handoff from {message.handoff_from}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

        {!isUser && (
          <div className="mt-3 pt-3 border-t border-white/5 relative">
            <button
              onClick={() => setShowHandoff((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-[#06B6D4]"
            >
              <ArrowRightCircle className="w-3.5 h-3.5" /> Send to…
            </button>
            {showHandoff && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PROVIDERS.filter((p) => p.id !== message.provider).map((p) => (
                  <button
                    key={p.id}
                    disabled={handoffPending}
                    onClick={() => { setShowHandoff(false); onHandoff(p.id); }}
                    className="px-2.5 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Memory ---------------- */

function MemoryPanel({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMemory);
  const createFn = useServerFn(createMemory);
  const pinFn = useServerFn(togglePinMemory);
  const delFn = useServerFn(deleteMemory);

  const { data } = useQuery({
    queryKey: ["memory", projectId],
    queryFn: () => listFn({ data: { projectId } }),
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const create = useMutation({
    mutationFn: () => createFn({ data: { projectId, title, content, pinned: true } }),
    onSuccess: () => {
      setTitle(""); setContent("");
      qc.invalidateQueries({ queryKey: ["memory", projectId] });
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Shared memory</h2>
        <p className="text-sm text-white/60 mt-1">Pinned notes are injected as system context into every AI turn across all four providers.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (title.trim() && content.trim()) create.mutate(); }}
        className="rounded-xl border border-white/10 bg-[#18181B] p-4 space-y-3"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" className="bg-white/5 border-white/10" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content — decisions, requirements, style, API keys usage rules…" className="bg-white/5 border-white/10 min-h-24" />
        <div className="flex justify-end">
          <Button type="submit" disabled={create.isPending} className="bg-[#7C3AED] hover:bg-[#7C3AED]/90">Add pinned note</Button>
        </div>
      </form>

      <div className="space-y-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-[#18181B] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium">{m.title}</h4>
                  {m.pinned && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#c4b5fd]">Pinned</span>}
                  {m.source && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/60">from {m.source}</span>}
                </div>
                <div className="text-sm text-white/70 mt-2 whitespace-pre-wrap">{m.content}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => pinFn({ data: { id: m.id, pinned: !m.pinned } }).then(() => qc.invalidateQueries({ queryKey: ["memory", projectId] }))}
                  className="p-1.5 rounded hover:bg-white/5 text-white/60"
                  title={m.pinned ? "Unpin" : "Pin"}
                >
                  {m.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => delFn({ data: { id: m.id } }).then(() => qc.invalidateQueries({ queryKey: ["memory", projectId] }))}
                  className="p-1.5 rounded hover:bg-white/5 text-red-400/70 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="text-center text-white/40 py-8">No notes yet.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Files ---------------- */

function FilesPanel({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listFiles);
  const signFn = useServerFn(createUploadUrl);
  const registerFn = useServerFn(registerFile);
  const delFn = useServerFn(deleteFile);

  const { data } = useQuery({
    queryKey: ["files", projectId],
    queryFn: () => listFn({ data: { projectId } }),
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const { path, token } = await signFn({ data: { projectId, filename: file.name } });
      const { error } = await supabase.storage
        .from("project-files")
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw error;
      await registerFn({
        data: { projectId, name: file.name, storagePath: path, mimeType: file.type, sizeBytes: file.size },
      });
      qc.invalidateQueries({ queryKey: ["files", projectId] });
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Shared files</h2>
          <p className="text-sm text-white/60 mt-1">Reference material available to all agents in this project.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="bg-[#06B6D4] text-black hover:bg-[#06B6D4]/90">
          <Upload className="w-4 h-4 mr-2" /> {uploading ? "Uploading…" : "Upload file"}
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#18181B] divide-y divide-white/5">
        {(data ?? []).map((f) => (
          <div key={f.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-white/50 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-white/50">
                  {f.mime_type ?? "unknown"} · {f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => delFn({ data: { id: f.id } }).then(() => qc.invalidateQueries({ queryKey: ["files", projectId] }))}
              className="text-white/40 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {(!data || data.length === 0) && <div className="p-8 text-center text-white/40">No files yet.</div>}
      </div>
    </div>
  );
}

/* ---------------- Analytics ---------------- */

function AnalyticsPanel({ projectId }: { projectId: string }) {
  const fn = useServerFn(getProjectAnalytics);
  const { data } = useQuery({
    queryKey: ["analytics", projectId],
    queryFn: () => fn({ data: { projectId } }),
    refetchInterval: 15_000,
  });

  const cards = useMemo(
    () => [
      { label: "Total events", value: data?.totals.events ?? 0 },
      { label: "Handoffs", value: data?.totals.handoffs ?? 0 },
      { label: "Files uploaded", value: data?.totals.fileUploads ?? 0 },
      { label: "Tokens in / out", value: `${data?.totals.tokensIn ?? 0} / ${data?.totals.tokensOut ?? 0}` },
    ],
    [data],
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-[#18181B] p-4">
            <div className="text-xs uppercase text-white/50">{c.label}</div>
            <div className="text-2xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#18181B] p-4">
        <h3 className="font-medium mb-3">By provider</h3>
        <div className="space-y-2">
          {(data?.byProvider ?? []).map((r) => {
            const meta = PROVIDERS.find((p) => p.id === r.provider);
            return (
              <div key={r.provider} className="grid grid-cols-5 gap-3 items-center text-sm">
                <div className="flex items-center gap-2">
                  {meta && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />}
                  <span className="capitalize">{r.provider}</span>
                </div>
                <div className="text-white/70">{r.messages} msgs</div>
                <div className="text-white/70">{r.tokensIn} in</div>
                <div className="text-white/70">{r.tokensOut} out</div>
                <div className="text-white/70">{r.avgLatencyMs}ms avg</div>
              </div>
            );
          })}
          {(!data || data.byProvider.length === 0) && (
            <div className="text-white/40 text-sm">No activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
