import { useCallback, useEffect, useState } from "react";

const FAV_KEY = "agenthub:favorites";
const RECENT_KEY = "agenthub:recents";
const MAX_RECENTS = 10;

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("agenthub:store", { detail: { key } }));
}

function useLocalList(key: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(read(key));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (!detail || detail.key === key) setList(read(key));
    };
    window.addEventListener("agenthub:store", handler);
    window.addEventListener("storage", () => setList(read(key)));
    return () => window.removeEventListener("agenthub:store", handler);
  }, [key]);
  return [list, setList] as const;
}

export function useFavorites() {
  const [favorites] = useLocalList(FAV_KEY);
  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);
  const toggle = useCallback((id: string) => {
    const curr = read(FAV_KEY);
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    write(FAV_KEY, next);
  }, []);
  return { favorites, isFavorite, toggle };
}

export function useRecents() {
  const [recents] = useLocalList(RECENT_KEY);
  const push = useCallback((id: string) => {
    const curr = read(RECENT_KEY).filter((x) => x !== id);
    const next = [id, ...curr].slice(0, MAX_RECENTS);
    write(RECENT_KEY, next);
  }, []);
  return { recents, push };
}
