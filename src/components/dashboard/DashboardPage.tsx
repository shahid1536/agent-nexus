import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, FolderKanban, Bot, MessageSquare, FileText, Brain, Zap, BarChart3, Settings,
  Search, Bell, ChevronDown, Plus, Sparkles, Command, Mic, Upload, Users, Circle,
  Cpu, Rocket, Flame, Trophy, ArrowUpRight, Check, MoreHorizontal, Code2,
  ChevronLeft, LayoutGrid, Terminal, Radio, Activity, GitBranch, ShieldCheck,
  BookOpen, TestTube2, Layers, PanelLeft, X, Waves, Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AgentCatalog } from "@/components/dashboard/AgentCatalog";

/* ============================================================
   AgentHub — AI Developer Command Center
   Single-file, section-composed premium dashboard.
   ============================================================ */

import { Heart, History, User as UserIcon, Menu } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";


const navItems: Array<{
  icon: typeof Home;
  label: string;
  to: string;
  badge?: string;
}> = [
  { icon: Home, label: "Dashboard", to: "/" },
  { icon: Bot, label: "AI Agents", to: "/#agents" },
  { icon: FolderKanban, label: "Projects", to: "/projects" },
  { icon: BarChart3, label: "Analytics", to: "/#analytics" },
  { icon: Heart, label: "Favorites", to: "/favorites" },
  { icon: History, label: "Recent Activity", to: "/#recent" },
  { icon: Settings, label: "Settings", to: "/#settings" },
  { icon: UserIcon, label: "Profile", to: "/profile" },
];

const agents = [
  { name: "ChatGPT", short: "CG", color: "#10A37F", task: "Refactoring auth module", mem: 68, req: 142, latency: "312ms" },
  { name: "Claude", short: "CL", color: "#D97757", task: "Writing API documentation", mem: 42, req: 89, latency: "418ms" },
  { name: "Gemini", short: "GM", color: "#4285F4", task: "Analyzing dataset trends", mem: 55, req: 76, latency: "289ms" },
  { name: "Perplexity", short: "PX", color: "#20808D", task: "Researching best practices", mem: 22, req: 41, latency: "512ms" },
];

const workspaceTabs = [
  { id: "frontend", label: "Frontend", icon: Layers },
  { id: "backend", label: "Backend", icon: Terminal },
  { id: "design", label: "Design", icon: Sparkles },
  { id: "research", label: "Research", icon: BookOpen },
  { id: "testing", label: "Testing", icon: TestTube2 },
  { id: "devops", label: "DevOps", icon: ShieldCheck },
];

const missionTasks = [
  { label: "Design Dashboard", done: true },
  { label: "Create API", done: false },
  { label: "Build Authentication", done: false },
  { label: "Deploy Project", done: false },
];

const recentConvos = [
  { title: "React Dashboard", time: "2m", agent: "Claude", msg: "Generated 12 components with Tailwind..." },
  { title: "Authentication API", time: "1h", agent: "ChatGPT", msg: "JWT strategy with refresh tokens..." },
  { title: "Docker Setup", time: "3h", agent: "Perplexity", msg: "Multi-stage build for production..." },
  { title: "Tailwind Components", time: "5h", agent: "Gemini", msg: "Refactored to use CSS variables..." },
  { title: "Database Optimization", time: "1d", agent: "ChatGPT", msg: "Added indexes on foreign keys..." },
];

/* ---------- Sidebar ---------- */
function SidebarNav({ collapsed, pathname, onNavigate }: { collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="mt-2 flex-1 space-y-1 px-3">
      {navItems.map((item) => {
        const target = item.to.split("#")[0] || "/";
        const active = pathname === target;
        const Row = (
          <>
            {active && (
              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-primary shadow-[0_0_12px] shadow-primary" />
            )}
            <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </>
        );
        const className = cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-primary/20 to-primary/5 text-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/8%)]"
            : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground hover:translate-x-0.5",
          collapsed && "justify-center px-2"
        );
        return (
          <Link
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            className={className}
            title={collapsed ? item.label : undefined}
          >
            {Row}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarShell({ collapsed, onToggle, pathname, onNavigate, isMobile }: { collapsed: boolean; onToggle: () => void; pathname: string; onNavigate?: () => void; isMobile?: boolean }) {
  return (
    <>
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan shadow-lg shadow-primary/40">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col leading-tight"
            >
              <span className="text-[15px] font-bold tracking-tight">AgentHub</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Command Center</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SidebarNav collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />

      <div className="border-t border-border/60 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Rocket className="h-3.5 w-3.5 text-primary" /> Upgrade to Pro
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Unlock unlimited agents & priority compute.
            </p>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}

function Sidebar({ collapsed, onToggle, pathname }: { collapsed: boolean; onToggle: () => void; pathname: string }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative z-20 hidden flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl md:flex"
    >
      <SidebarShell collapsed={collapsed} onToggle={onToggle} pathname={pathname} />
    </motion.aside>
  );
}

function MobileSidebar({ open, onOpenChange, pathname }: { open: boolean; onOpenChange: (v: boolean) => void; pathname: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-xl md:hidden"
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarShell collapsed={false} onToggle={() => {}} pathname={pathname} onNavigate={() => onOpenChange(false)} isMobile />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Top Bar ---------- */
function TopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
      <button
        onClick={onOpenMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 text-sm">
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04]">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-primary to-cyan text-[10px] font-bold">AH</div>
          <span className="font-semibold">Personal Workspace</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>


      <div className="relative mx-auto flex w-full max-w-xl items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search projects, agents, files..."
          className="h-9 w-full rounded-xl border border-border/60 bg-white/[0.03] pl-9 pr-16 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="absolute right-3 flex items-center gap-1 rounded-md border border-border/80 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 hover:opacity-95">
          <Plus className="h-4 w-4" /> New Chat
        </Button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 hover:bg-white/[0.04]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
        </button>
        <button className="flex h-9 items-center gap-2 rounded-xl border border-border/60 pl-1 pr-3 hover:bg-white/[0.04]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-primary text-xs font-bold">DV</div>
          <span className="text-sm font-medium">Dev</span>
        </button>
      </div>
    </header>
  );
}

/* ---------- Animated blobs ---------- */
function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-blob absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="animate-blob absolute top-20 right-1/4 h-96 w-96 rounded-full bg-cyan/20 blur-3xl [animation-delay:-6s]" />
      <div className="animate-blob absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-primary/15 blur-3xl [animation-delay:-12s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(1_0_0/6%)_1px,transparent_0)] [background-size:32px_32px] opacity-40" />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur-xl">
      <Blobs />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          👋 Welcome back, Developer
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Let's build something{" "}
          <span className="gradient-text">amazing today.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Your AI agents are online, memory synced, and workflows primed. Ship faster with a mission-control view of every model, project, and conversation.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button className="gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30">
            <Sparkles className="h-4 w-4" /> Ask All Agents
          </Button>
          <Button variant="outline" className="gap-1.5 rounded-xl border-border/60 bg-white/[0.02]">
            <Code2 className="h-4 w-4" /> Open Playground
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stat Cards ---------- */
const stats = [
  { label: "Active Projects", value: "12", icon: Flame, delta: "+3", color: "from-orange-500/20 to-red-500/5", iconColor: "text-orange-400" },
  { label: "Connected Agents", value: "8", icon: Bot, delta: "+2", color: "from-primary/25 to-primary/5", iconColor: "text-primary" },
  { label: "Today's AI Requests", value: "257", icon: Zap, delta: "+42", color: "from-cyan/25 to-cyan/5", iconColor: "text-cyan" },
  { label: "Productivity", value: "82%", icon: Trophy, delta: "+8%", color: "from-success/25 to-success/5", iconColor: "text-success" },
];

function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -4 }}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-shadow",
            "hover:border-primary/30 hover:shadow-[0_10px_40px_-10px] hover:shadow-primary/40"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", s.color)} />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 backdrop-blur", s.iconColor)}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-0.5 rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                <ArrowUpRight className="h-3 w-3" /> {s.delta}
              </span>
            </div>
            <div className="mt-4 text-3xl font-bold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Agent Grid ---------- */
function AgentCard({ agent, i }: { agent: typeof agents[number]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-[0_20px_60px_-20px] hover:shadow-primary/50"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan/5" />
      </div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}99)` }}
            >
              {agent.short}
            </div>
            <div>
              <div className="text-sm font-semibold">{agent.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Online
              </div>
            </div>
          </div>
          <button className="text-muted-foreground opacity-0 transition group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2 text-[11px]">
          <div className="text-muted-foreground">Current task</div>
          <div className="mt-0.5 truncate font-medium">{agent.task}</div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Memory</span>
            <span className="font-mono text-foreground">{agent.mem}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agent.mem}%` }}
              transition={{ duration: 1, delay: i * 0.05 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-white/[0.02] px-2 py-1.5">
            <div className="text-muted-foreground">Requests</div>
            <div className="font-mono font-semibold">{agent.req}</div>
          </div>
          <div className="rounded-lg bg-white/[0.02] px-2 py-1.5">
            <div className="text-muted-foreground">Latency</div>
            <div className="font-mono font-semibold">{agent.latency}</div>
          </div>
        </div>

        <Button size="sm" className="mt-4 h-8 w-full rounded-lg bg-white/5 text-xs hover:bg-primary hover:shadow-lg hover:shadow-primary/40">
          Open Chat
        </Button>
      </div>
    </motion.div>
  );
}

function AgentGrid() {
  return (
    <section>
      <SectionHeader
        icon={Bot}
        title="AI Agents"
        subtitle="Live status across your connected models"
        action="View all"
      />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((a, i) => (
          <AgentCard key={a.name} agent={a} i={i} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Workspace Tabs ---------- */
function WorkspaceTabs({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-border/60 px-1">
      {workspaceTabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-t-lg px-3.5 py-2.5 text-xs font-medium transition",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-primary to-cyan"
              />
            )}
          </button>
        );
      })}
      <button className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.04] hover:text-foreground">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ---------- Chat Preview ---------- */
function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function ChatPreview() {
  const [tab, setTab] = useState("frontend");
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl">
      <WorkspaceTabs active={tab} onChange={setTab} />
      <div className="p-5">
        {/* user */}
        <div className="flex justify-end">
          <div className="max-w-md rounded-2xl rounded-tr-md bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-sm text-white shadow-lg shadow-primary/30">
            Generate a React Authentication Dashboard.
          </div>
        </div>
        {/* assistant */}
        <div className="mt-5 flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan text-[10px] font-bold text-white">
            AI
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Claude Sonnet</span>
              <span>·</span>
              <span>just now</span>
              <TypingDots />
            </div>
            <div className="mt-2 text-sm leading-relaxed">
              I'll scaffold a modern auth dashboard with JWT sessions, protected routes, and role-based UI. Here's the entry component:
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-black/40 font-mono text-[12px]">
              <div className="flex items-center justify-between border-b border-border/60 bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-2 text-[10px] text-muted-foreground">AuthDashboard.tsx</span>
                </div>
                <span className="text-[10px] text-muted-foreground">tsx</span>
              </div>
              <pre className="overflow-x-auto p-4 leading-relaxed">
<span className="text-primary">import</span> {"{ useAuth }"} <span className="text-primary">from</span> <span className="text-success">"@/hooks/auth"</span>;{"\n"}
<span className="text-primary">import</span> {"{ Card }"} <span className="text-primary">from</span> <span className="text-success">"@/components/ui/card"</span>;{"\n\n"}
<span className="text-cyan">export function</span> <span className="text-warning">AuthDashboard</span>() {"{"}{"\n"}
{"  "}<span className="text-cyan">const</span> {"{ user, signOut }"} = useAuth();{"\n"}
{"  "}<span className="text-primary">return</span> ({"\n"}
{"    "}{"<Card className=\"glass\">"}{"\n"}
{"      "}{"<h2>Welcome, {user.name}</h2>"}{"\n"}
{"      "}{"<Button onClick={signOut}>Sign out</Button>"}{"\n"}
{"    "}{"</Card>"}{"\n"}
{"  "});{"\n"}
{"}"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Ask Multiple Agents / Command Center ---------- */
const askable = ["ChatGPT", "Claude", "Gemini", "Perplexity"] as const;

function AskMultipleAgents({ onLaunch }: { onLaunch: () => void }) {
  const [selected, setSelected] = useState<string[]>([...askable]);
  const toggle = (n: string) =>
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-card/60 to-cyan/10 p-6 backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
            <Network className="h-3 w-3" /> Multi-Agent
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Ask multiple agents at once</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Fan out your prompt to selected models and compare answers side by side in the command center.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {askable.map((name) => {
              const on = selected.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                    on
                      ? "border-primary/50 bg-primary/15 text-foreground shadow-lg shadow-primary/20"
                      : "border-border/60 bg-white/[0.02] text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Checkbox checked={on} className="h-3.5 w-3.5" />
                  {name}
                </button>
              );
            })}
          </div>
        </div>
        <Button
          onClick={onLaunch}
          className="h-11 gap-2 rounded-xl bg-gradient-to-r from-primary via-primary to-cyan px-5 text-sm font-semibold shadow-xl shadow-primary/40 hover:opacity-95"
        >
          <Radio className="h-4 w-4" /> Launch Command Center
        </Button>
      </div>

      <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {selected.slice(0, 4).map((n, i) => {
          const a = agents.find((x) => x.name === n) ?? agents[i];
          return (
            <div key={n} className="rounded-xl border border-border/60 bg-black/30 p-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ background: a.color }}
                >
                  {a.short}
                </div>
                <span className="text-xs font-semibold">{n}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">draft</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {[90, 70, 85].map((w, j) => (
                  <div key={j} className="h-1.5 overflow-hidden rounded bg-white/5">
                    <div
                      className="h-full animate-pulse rounded bg-gradient-to-r from-primary/50 to-cyan/40"
                      style={{ width: `${w}%`, animationDelay: `${j * 120}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Command Center Modal ---------- */
const workflow = [
  { label: "Research", agent: "Perplexity", color: "#20808D", status: "completed" as const },
  { label: "Planning", agent: "Claude", color: "#D97757", status: "completed" as const },
  { label: "Coding", agent: "Gemini", color: "#4285F4", status: "generating" as const },
  { label: "Testing", agent: "ChatGPT", color: "#10A37F", status: "thinking" as const },
  { label: "Docs", agent: "Perplexity", color: "#20808D", status: "queued" as const },
];

const statusMeta: Record<string, { label: string; color: string; dot: string }> = {
  completed: { label: "Completed", color: "text-success", dot: "bg-success" },
  generating: { label: "Generating", color: "text-primary", dot: "bg-primary" },
  thinking: { label: "Thinking", color: "text-cyan", dot: "bg-cyan" },
  queued: { label: "Queued", color: "text-muted-foreground", dot: "bg-muted-foreground" },
};

function CommandCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-2xl"
        >
          <Blobs />
          <div className="relative flex h-16 items-center gap-3 border-b border-border/60 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan shadow-lg shadow-primary/40">
              <Radio className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">AI Command Center</div>
              <div className="text-[11px] text-muted-foreground">Live multi-agent orchestration</div>
            </div>
            <div className="ml-6 hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <Activity className="h-3.5 w-3.5 text-success" /> 4 agents streaming
              <span className="mx-2 h-3 w-px bg-border" />
              <Waves className="h-3.5 w-3.5 text-cyan" /> 218 tok/s
            </div>
            <button
              onClick={onClose}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 hover:bg-white/[0.04]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Workflow graph */}
          <div className="relative border-b border-border/60 px-6 py-5">
            <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" /> Workflow Pipeline
            </div>
            <div className="relative flex items-center justify-between gap-2">
              <svg className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-2 w-full -translate-y-1/2" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="flow" x1="0" x2="1">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#flow)" strokeWidth="1.5" strokeDasharray="4 6" />
              </svg>
              {workflow.map((step) => {
                const meta = statusMeta[step.status];
                const active = step.status === "generating" || step.status === "thinking";
                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "relative flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-bold text-white",
                        active ? "animate-pulse-ring" : ""
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`,
                        borderColor: step.color,
                      }}
                    >
                      {step.agent.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold">{step.label}</div>
                      <div className={cn("flex items-center justify-center gap-1 text-[10px]", meta.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} /> {meta.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Split panels + timeline */}
          <div className="relative grid flex-1 grid-cols-1 gap-4 overflow-hidden p-6 lg:grid-cols-[1fr_320px]">
            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-2">
              {askable.map((name, i) => {
                const a = agents.find((x) => x.name === name)!;
                const active = i < 3;
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      "relative flex flex-col overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-xl",
                      active ? "border-primary/40 shadow-[0_10px_40px_-10px] shadow-primary/40" : "border-border/60"
                    )}
                  >
                    {active && (
                      <div className="pointer-events-none absolute inset-0 -z-0">
                        <div className="absolute -inset-px animate-pulse rounded-2xl bg-gradient-to-br from-primary/10 to-cyan/5" />
                      </div>
                    )}
                    <div className="relative flex items-center gap-2 border-b border-border/60 px-4 py-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ background: a.color }}
                      >
                        {a.short}
                      </div>
                      <span className="text-sm font-semibold">{name}</span>
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        {active ? (
                          <>
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                            </span>
                            Streaming
                          </>
                        ) : (
                          <>Queued</>
                        )}
                      </span>
                    </div>
                    <div className="relative p-4 text-xs leading-relaxed text-muted-foreground">
                      {active ? (
                        <>
                          <p>
                            Here's a scalable React authentication dashboard using JWT with refresh
                            tokens, protected routes via a route guard, and role-based UI states…
                          </p>
                          <div className="mt-3 space-y-1.5">
                            {[80, 60, 90, 45].map((w, j) => (
                              <div key={j} className="h-1.5 overflow-hidden rounded bg-white/5">
                                <motion.div
                                  className="h-full rounded bg-gradient-to-r from-primary to-cyan"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${w}%` }}
                                  transition={{ duration: 1.4, delay: j * 0.15, repeat: Infinity, repeatType: "reverse" }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-primary">
                            <TypingDots /> <span>thinking…</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-24 items-center justify-center text-[11px] text-muted-foreground">
                          Awaiting upstream…
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Timeline */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
              <div className="border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" /> Activity Timeline
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                <div className="relative pl-4">
                  <div className="absolute left-1 top-1 h-full w-px bg-gradient-to-b from-primary via-cyan to-transparent" />
                  {[
                    { agent: "Perplexity", text: "Completed research on auth patterns", color: "#20808D", tone: "success" },
                    { agent: "Claude", text: "Planned component architecture", color: "#D97757", tone: "success" },
                    { agent: "Gemini", text: "Generating AuthDashboard.tsx", color: "#4285F4", tone: "primary" },
                    { agent: "ChatGPT", text: "Reviewing edge cases…", color: "#10A37F", tone: "cyan" },
                    { agent: "Perplexity", text: "Waiting to draft documentation", color: "#20808D", tone: "muted" },
                  ].map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative mb-4 last:mb-0"
                    >
                      <span
                        className={cn(
                          "absolute -left-[13px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card",
                          e.tone === "success" && "bg-success",
                          e.tone === "primary" && "bg-primary animate-pulse",
                          e.tone === "cyan" && "bg-cyan animate-pulse",
                          e.tone === "muted" && "bg-muted-foreground"
                        )}
                      />
                      <div className="text-[11px] font-semibold" style={{ color: e.color }}>
                        {e.agent}
                      </div>
                      <div className="text-xs text-muted-foreground">{e.text}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Mission Panel ---------- */
function MissionPanel() {
  const done = missionTasks.filter((t) => t.done).length;
  const pct = 82;
  const r = 40;
  const c = 2 * Math.PI * r;

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-warning" /> Today's Mission
        </div>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} strokeWidth="8" className="fill-none stroke-white/5" />
              <circle
                cx="50" cy="50" r={r} strokeWidth="8" strokeLinecap="round"
                className="fill-none"
                stroke="url(#ring)"
                strokeDasharray={c}
                strokeDashoffset={c - (c * pct) / 100}
              />
              <defs>
                <linearGradient id="ring" x1="0" x2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-bold">{pct}%</div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Focus</div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Streak</span>
              <span className="flex items-center gap-1 font-semibold text-warning">
                <Flame className="h-3.5 w-3.5" /> 17 days
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Focus</span>
              <span className="font-semibold">Frontend</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tasks</span>
              <span className="font-mono font-semibold">{done}/{missionTasks.length}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          {missionTasks.map((t) => (
            <label
              key={t.label}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/[0.03]"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border",
                  t.done ? "border-primary bg-primary" : "border-border"
                )}
              >
                {t.done && <Check className="h-3 w-3 text-primary-foreground" />}
              </span>
              <span className={cn("flex-1", t.done && "text-muted-foreground line-through")}>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Recent Convos */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Recent
          </div>
          <button className="text-[11px] text-muted-foreground hover:text-foreground">View all</button>
        </div>
        <div className="mt-4 space-y-1">
          {recentConvos.map((c) => (
            <button
              key={c.title}
              className="group flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/[0.03]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-cyan/20 text-[10px] font-bold">
                {c.agent.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.title}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{c.msg}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------- Section Header ---------- */
function SectionHeader({
  icon: Icon, title, subtitle, action,
}: { icon: React.ElementType; title: string; subtitle?: string; action?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {title}
        </div>
        {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {action && (
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          {action} <ArrowUpRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* ---------- FAB ---------- */
const fabItems = [
  { icon: MessageSquare, label: "New Chat" },
  { icon: Upload, label: "Upload Files" },
  { icon: LayoutGrid, label: "New Workspace" },
  { icon: Mic, label: "Voice Chat" },
  { icon: Users, label: "Invite Team" },
];

function FloatingAction() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="mb-3 w-56 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {fabItems.map((i) => (
              <button
                key={i.label}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.05]"
              >
                <i.icon className="h-4 w-4 text-primary" /> {i.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan text-white shadow-2xl shadow-primary/40"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }}>
          <Plus className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ---------- Dock ---------- */
const dockItems = [
  { icon: MessageSquare, label: "Chat" },
  { icon: FolderKanban, label: "Projects" },
  { icon: Bot, label: "Agents" },
  { icon: Bell, label: "Alerts" },
  { icon: Settings, label: "Settings" },
];

function Dock() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div
        onMouseLeave={() => setHover(null)}
        className="pointer-events-auto flex items-end gap-1 rounded-2xl border border-border/60 bg-card/70 p-2 shadow-2xl backdrop-blur-2xl"
      >
        {dockItems.map((d, i) => {
          const dist = hover === null ? 0 : Math.abs(hover - i);
          const scale = hover === null ? 1 : Math.max(1, 1.5 - dist * 0.2);
          return (
            <motion.button
              key={d.label}
              onMouseEnter={() => setHover(i)}
              animate={{ scale }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] hover:bg-primary/20 hover:text-primary"
            >
              <d.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute -top-8 rounded-md border border-border/60 bg-card px-2 py-0.5 text-[10px] opacity-0 shadow-lg transition group-hover:opacity-100">
                {d.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export function DashboardPage() {
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [center, setCenter] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#09090B] text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} pathname={pathname} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} pathname={pathname} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenMobile={() => setMobileOpen(true)} />


        <main className="relative flex-1 overflow-y-auto scrollbar-thin">
          <div className="pointer-events-none absolute inset-0 mesh-bg opacity-70" />
          <div className="relative mx-auto max-w-[1600px] px-6 pb-32 pt-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <Hero />
                <StatCards />
                <AskMultipleAgents onLaunch={() => setCenter(true)} />
                <ChatPreview />
                <AgentCatalog />
              </div>
              <MissionPanel />
            </div>
          </div>
        </main>
      </div>

      <FloatingAction />
      <Dock />
      <CommandCenter open={center} onClose={() => setCenter(false)} />
    </div>
  );
}
