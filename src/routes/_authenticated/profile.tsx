import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, Settings, Pencil, Heart, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useFavorites, useRecents } from "@/hooks/useAgentStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  ssr: false,
  component: ProfilePage,
});

function initials(name?: string | null, email?: string | null) {
  const src = (name || email || "U").trim();
  const parts = src.split(/\s+/);
  return (parts[0]?.[0] ?? "U").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string | null; name: string | null; avatar: string | null; createdAt: string | null } | null>(null);
  const { favorites } = useFavorites();
  const { recents } = useRecents();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUser({
        email: u.email ?? null,
        name: (u.user_metadata?.full_name as string | undefined) ?? (u.user_metadata?.name as string | undefined) ?? null,
        avatar: (u.user_metadata?.avatar_url as string | undefined) ?? null,
        createdAt: u.created_at ?? null,
      });
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-foreground">
      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/60 bg-white/[0.02]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan text-2xl font-bold text-white shadow-lg shadow-primary/40">
                  {initials(user?.name, user?.email)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-success">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold tracking-tight">{user?.name || "Developer"}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{user?.email || "—"}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/60 bg-white/[0.02]" onClick={() => toast.info("Edit profile coming soon")}>
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/60 bg-white/[0.02]" onClick={() => toast.info("Settings coming soon")}>
                <Settings className="h-3.5 w-3.5" /> Settings
              </Button>
              <Button size="sm" onClick={signOut} className="gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link to="/favorites" className="group overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Heart className="h-5 w-5" />
              </div>
              <span className="text-3xl font-bold tracking-tight">{favorites.length}</span>
            </div>
            <div className="mt-3 text-sm font-medium">Favorites</div>
            <div className="text-xs text-muted-foreground">Agents you've saved</div>
          </Link>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-3xl font-bold tracking-tight">{recents.length}</span>
            </div>
            <div className="mt-3 text-sm font-medium">Recently Used</div>
            <div className="text-xs text-muted-foreground">Last {recents.length} launches</div>
          </div>
        </div>
      </div>
    </div>
  );
}
