"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { Tag } from "@/components/tag";
import { TooltipWrap } from "@/components/tooltip-wrap";
import { useUsersStore } from "@/hooks/use-users-store";
import { hoverTintClass, USER_ROLE_TINT } from "@/lib/colors";

/** There's no real auth session yet, so this id stands in for the signed-in user — same account the /profile page edits. */
const CURRENT_USER_ID = 1;

const menuItemBase = "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors";

export const ProfileMenu = () => {
  const { users } = useUsersStore();
  const currentUser = users.find(u => u.id === CURRENT_USER_ID) ?? users[0];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative ml-1" ref={ref}>
      <TooltipWrap label={currentUser.name} placement="bottom" align="end">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
        >
          {currentUser.initials}
        </button>
      </TooltipWrap>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            </div>
          </div>

          <div className="px-4 py-2.5 border-b border-border">
            <Tag color={USER_ROLE_TINT[currentUser.role] ?? "muted"}>{currentUser.role}</Tag>
          </div>

          <div className="py-1">
            <Link href="/profile" onClick={() => setOpen(false)} className={`${menuItemBase} text-foreground ${hoverTintClass("aqua")}`}>
              <User size={15} className="text-muted-foreground" /> View Profile
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)} className={`${menuItemBase} text-foreground ${hoverTintClass("aqua")}`}>
              <Settings size={15} className="text-muted-foreground" /> Settings
            </Link>
          </div>

          <button
            onClick={() => { setOpen(false); router.push("/login"); }}
            className={`${menuItemBase} w-full text-left border-t border-border text-destructive ${hoverTintClass("destructive")}`}
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );
};
