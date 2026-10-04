import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listProjects, createProject, deleteProject } from "@/lib/projects.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Sparkles, Trash2, ArrowRight, LogOut, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listProjects);
  const createFn = useServerFn(createProject);
  const deleteFn = useServerFn(deleteProject);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listFn(),
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation({
    mutationFn: (input: { title: string; description?: string }) => createFn({ data: input }),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setTitle("");
      setDescription("");
      navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <header className="border-b border-white/10 bg-[#18181B]/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/projects" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm">Agent Nexus</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Workspaces</div>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-white/70 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your projects</h1>
            <p className="text-white/60 mt-1">Every project has its own ChatGPT, Claude, Gemini & Copilot conversations sharing context.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> New project
          </Button>
        </div>

        {open && (
          <div className="mb-8 rounded-xl border border-white/10 bg-[#18181B] p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) return;
                create.mutate({ title: title.trim(), description: description.trim() || undefined });
              }}
              className="space-y-3"
            >
              <Input
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10"
                autoFocus
              />
              <Textarea
                placeholder="What are you working on? (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={create.isPending} className="bg-[#7C3AED] hover:bg-[#7C3AED]/90">
                  {create.isPending ? "Creating…" : "Create project"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-white/50">Loading projects…</div>
        ) : (projects ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">
            <FolderKanban className="w-10 h-10 mx-auto text-white/40 mb-3" />
            <div className="font-medium">No projects yet</div>
            <div className="text-sm text-white/50 mt-1">Create your first project to start collaborating with 4 AI agents.</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(projects ?? []).map((p) => (
              <div
                key={p.id}
                className="group rounded-xl border border-white/10 bg-[#18181B] hover:border-[#7C3AED]/50 transition-all p-5 flex flex-col"
              >
                <div className="flex items-start justify-between">
                  <Link to="/projects/$projectId" params={{ projectId: p.id }} className="flex-1">
                    <h3 className="font-semibold group-hover:text-[#06B6D4] transition-colors">{p.title}</h3>
                    {p.description && <p className="text-sm text-white/60 mt-1 line-clamp-2">{p.description}</p>}
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id);
                    }}
                    className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span>Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}</span>
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="inline-flex items-center gap-1 text-[#06B6D4] hover:underline"
                  >
                    Open <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
