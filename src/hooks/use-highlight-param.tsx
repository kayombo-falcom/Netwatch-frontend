"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Strips the ?highlight=<id> param from the URL and exposes the id briefly so the matching row can blink.
export const useHighlightParam = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("highlight");

  const [prevRaw, setPrevRaw] = useState(raw);
  const [activeId, setActiveId] = useState(raw);
  if (raw !== prevRaw) {
    setPrevRaw(raw);
    // Only a new id (re)activates the blink; the timer, not the URL-stripping null, clears it.
    if (raw) setActiveId(raw);
  }

  useEffect(() => {
    if (!raw) return;
    router.replace(pathname, { scroll: false });
  }, [raw, pathname, router]);

  useEffect(() => {
    if (!activeId) return;
    const timer = setTimeout(() => setActiveId(null), 3500);
    return () => clearTimeout(timer);
  }, [activeId]);

  return activeId;
};
