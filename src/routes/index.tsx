import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, User } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link to="/favorites">
          <Button size="sm" variant="outline" className="rounded-xl border-border/60 bg-background/60 backdrop-blur">
            <Heart className="w-4 h-4 mr-1.5" /> Favorites
          </Button>
        </Link>
        <Link to="/profile">
          <Button size="sm" variant="outline" className="rounded-xl border-border/60 bg-background/60 backdrop-blur">
            <User className="w-4 h-4 mr-1.5" /> Profile
          </Button>
        </Link>
        <Link to="/projects">
          <Button size="sm" className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 shadow-lg rounded-xl">
            Open Workspaces <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
      <DashboardPage />
    </div>
  );
}
