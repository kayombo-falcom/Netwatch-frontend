"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { UserFormDraft } from "@/components/user-form-dialog";

/** Only one dialog kind exists today (the users add/edit form); extend this union if a second one shows up. */
export type DialogDescriptor = { mode: "add" | "edit"; userId?: number; draft: UserFormDraft };

type DialogEntry = { path: string; minimized: boolean; descriptor: DialogDescriptor };

const STORAGE_KEY = "netwatch-dialog";

const readStored = (): DialogEntry | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DialogEntry) : null;
  } catch {
    return null;
  }
};

const persist = (entry: DialogEntry | null) => {
  if (typeof window === "undefined") return;
  if (entry) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  else window.sessionStorage.removeItem(STORAGE_KEY);
};

/**
 * Renders whatever dialog is handed to it at the dashboard-layout level (see
 * `(dashboard)/layout.tsx`), which stays mounted across page navigation —
 * that's what lets a minimized create/edit dialog survive the user switching
 * pages and coming back. The dialog is scoped to the page it was opened from
 * (hidden via CSS, not unmounted, on any other page) and mirrored to
 * `sessionStorage` on every change, so a full page refresh restores it too.
 */
const DialogHostContext = createContext<{
  openDialog: (descriptor: DialogDescriptor) => void;
  closeDialog: () => void;
} | null>(null);

export const DialogHostProvider = ({
  children, renderDialog,
}: {
  children: ReactNode;
  renderDialog: (descriptor: DialogDescriptor, ctx: {
    minimized: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onRestore: () => void;
    onDraftChange: (draft: UserFormDraft) => void;
  }) => ReactNode;
}) => {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  const [entry, setEntry] = useState<DialogEntry | null>(null);

  useEffect(() => {
    const stored = readStored();
    if (stored) setEntry(stored);
  }, []);

  const openDialog = useCallback((descriptor: DialogDescriptor) => {
    const next = { path: pathnameRef.current, minimized: false, descriptor };
    setEntry(next);
    persist(next);
  }, []);

  const closeDialog = useCallback(() => {
    setEntry(null);
    persist(null);
  }, []);

  const minimize = useCallback(() => {
    setEntry(e => {
      if (!e) return e;
      const next = { ...e, minimized: true };
      persist(next);
      return next;
    });
  }, []);

  const restore = useCallback(() => {
    setEntry(e => {
      if (!e) return e;
      const next = { ...e, minimized: false };
      persist(next);
      return next;
    });
  }, []);

  const updateDraft = useCallback((draft: UserFormDraft) => {
    setEntry(e => {
      if (!e) return e;
      const next = { ...e, descriptor: { ...e.descriptor, draft } };
      persist(next);
      return next;
    });
  }, []);

  return (
    <DialogHostContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {entry && (
        <div className={entry.path === pathname ? "" : "hidden"}>
          {renderDialog(entry.descriptor, {
            minimized: entry.minimized,
            onClose: closeDialog,
            onMinimize: minimize,
            onRestore: restore,
            onDraftChange: updateDraft,
          })}
        </div>
      )}
    </DialogHostContext.Provider>
  );
};

export const useDialogHost = () => {
  const ctx = useContext(DialogHostContext);
  if (!ctx) throw new Error("useDialogHost must be used within a DialogHostProvider");
  return ctx;
};
