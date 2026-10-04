import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { AgentCatalog } from "@/components/dashboard/AgentCatalog";
import { AGENTS } from "@/data/agents";
import { useFavorites } from "@/hooks/useAgentStore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/favorites")({
  ssr: false,
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useFavorites();
  const favAgents = AGENTS.filter((a) => favorites.includes(a.id));

  return (
    <div className="min-h-screen bg-[#09090B] text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/60 bg-white/[0.02]">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-white/[0.03] px-3 py-1 text-xs">
            <Heart className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{favAgents.length} favorite{favAgents.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight">Your Favorites</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quick access to the AI agents you love most.</p>
        </div>

        <div className="mt-6">
          {favAgents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white/[0.02] p-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">No favorite agents yet.</p>
              <Link to="/">
                <Button size="sm" className="mt-4 rounded-xl bg-gradient-to-r from-primary to-primary/80">Browse agents</Button>
              </Link>
            </div>
          ) : (
            <AgentCatalog agents={favAgents} showControls={false} />
          )}
        </div>
      </div>
    </div>
  );
}
