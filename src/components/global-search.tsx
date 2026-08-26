"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Monitor, Users as UsersIcon } from "lucide-react";
import { devicesData } from "@/app/_lib/dashboard-data";
import { useUsersStore } from "@/hooks/use-users-store";

type Result = { id: string; label: string; sub: string; href: string; icon: React.ReactNode };

/**
 * Jump-anywhere search, distinct from the per-page filter inputs (Users,
 * Devices tables) which only narrow rows already loaded on that page.
 */
export const GlobalSearch = () => {
  const router = useRouter();
  const { users } = useUsersStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); } };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const results: Result[] = !q ? [] : [
    ...users
      .filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 4)
      .map(u => ({ id: `user-${u.id}`, label: u.name, sub: u.email, href: `/users?highlight=${u.id}`, icon: <UsersIcon size={13} /> })),
    ...devicesData
      .filter(d => d.name.toLowerCase().includes(q) || d.ip.includes(q) || d.user.toLowerCase().includes(q))
      .slice(0, 4)
      .map(d => ({ id: `device-${d.id}`, label: d.name, sub: d.ip, href: `/devices?highlight=${d.id}`, icon: <Monitor size={13} /> })),
  ];

  const goTo = (href: string) => {
    router.push(href);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query && setOpen(true)}
        placeholder="Search devices, users, IPs…"
        className="w-full pl-8 pr-11 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-colors"
      />
      {!query && (
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/60 border border-border rounded px-1.5 py-0.5 bg-card pointer-events-none">
          ⌘K
        </kbd>
      )}

      {open && q && (
        <div className="absolute top-full left-0 mt-2 w-full bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-xs text-muted-foreground/60">No matches for &ldquo;{query}&rdquo;</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map(r => (
                <li key={r.id}>
                  <button
                    onClick={() => goTo(r.href)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground shrink-0">{r.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-medium text-foreground truncate">{r.label}</span>
                      <span className="block text-xs text-muted-foreground/60 truncate">{r.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
