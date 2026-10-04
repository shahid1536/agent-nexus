import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Rocket, Search, Star, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AGENTS, CATEGORIES, type Agent } from "@/data/agents";
import { useFavorites, useRecents } from "@/hooks/useAgentStore";

interface Props {
  agents?: Agent[];
  emptyLabel?: string;
  showControls?: boolean;
}

export function AgentCatalog({ agents = AGENTS, emptyLabel = "No agents match your search.", showControls = true }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { isFavorite, toggle } = useFavorites();
  const { push } = useRecents();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      const matchesCat = category === "All" || a.category === category;
      const matchesQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [agents, query, category]);

  const launch = (a: Agent) => {
    push(a.id);
    if (a.url) window.open(a.url, "_blank", "noopener,noreferrer");
  };

  return (
    <section>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-cyan/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">AI Agents Catalog</h2>
          <p className="text-xs text-muted-foreground">Discover, favorite and launch {agents.length} curated AI tools.</p>
        </div>
      </div>

      {showControls && (
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, or description…"
              className="h-10 w-full rounded-xl border border-border/60 bg-white/[0.03] pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    active
                      ? "border-primary/60 bg-primary/15 text-foreground shadow-lg shadow-primary/20"
                      : "border-border/60 bg-white/[0.02] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((a, i) => (
            <motion.div
              layout
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-[0_20px_60px_-20px] hover:shadow-primary/50"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan/5" />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}99)` }}
                    >
                      {a.short}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{a.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className={cn("h-1.5 w-1.5 rounded-full", a.online ? "bg-success" : "bg-muted-foreground")} />
                        {a.online ? "Online" : "Offline"}
                        <span>·</span>
                        <span>{a.category}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(a.id)}
                    aria-label={isFavorite(a.id) ? "Remove from favorites" : "Add to favorites"}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                      isFavorite(a.id) ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite(a.id) && "fill-current")} />
                  </button>
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{a.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.02] px-2 py-1.5">
                    <Star className="h-3 w-3 text-warning" />
                    <span className="font-mono font-semibold">{a.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                  <div className="rounded-lg bg-white/[0.02] px-2 py-1.5">
                    <span className="font-mono font-semibold">{a.usage.toLocaleString()}</span>{" "}
                    <span className="text-muted-foreground">uses</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => launch(a)}
                  className="mt-4 h-8 w-full gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-xs shadow-lg shadow-primary/30 hover:opacity-95"
                >
                  <Rocket className="h-3.5 w-3.5" /> Launch Agent
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}
