export type AgentCategory = "Coding" | "Writing" | "Research";

export interface Agent {
  id: string;
  name: string;
  short: string;
  description: string;
  category: AgentCategory;
  color: string;
  rating: number;
  usage: number;
  featured: boolean;
  online: boolean;
  url?: string;
}

export const AGENTS: Agent[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    short: "CG",
    description: "OpenAI's flagship conversational AI for coding, reasoning, and writing.",
    category: "Coding",
    color: "#10A37F",
    rating: 4.9,
    usage: 128420,
    featured: true,
    online: true,
    url: "https://chat.openai.com",
  },
  {
    id: "claude",
    name: "Claude",
    short: "CL",
    description: "Anthropic's thoughtful assistant for long-context writing and analysis.",
    category: "Writing",
    color: "#D97757",
    rating: 4.8,
    usage: 98230,
    featured: true,
    online: true,
    url: "https://claude.ai",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    short: "PX",
    description: "Answer engine with cited web research and source transparency.",
    category: "Research",
    color: "#20808D",
    rating: 4.7,
    usage: 54120,
    featured: false,
    online: true,
    url: "https://perplexity.ai",
  },
  {
    id: "gemini",
    name: "Gemini",
    short: "GM",
    description: "Google's multimodal AI with deep research and reasoning capabilities.",
    category: "Research",
    color: "#4285F4",
    rating: 4.7,
    usage: 76540,
    featured: true,
    online: true,
    url: "https://gemini.google.com",
  },
];

export const CATEGORIES: (AgentCategory | "All")[] = ["All", "Coding", "Writing", "Research"];
