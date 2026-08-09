"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Reads a `?highlight=<id>` query param dropped by GlobalSearch, strips it
 * from the URL, and exposes the id for a few seconds so the destination page
 * can blink the matching row. The window is sized to outlast the slow-motion
 * `.highlight-blink` animation (2 x 1.4s cycles, see globals.css) plus the
 * simulated page-load delay it has to render through first.
 */
export const useHighlightParam = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("highlight");

  const [prevRaw, setPrevRaw] = useState(raw);
  const [activeId, setActiveId] = useState(raw);
  if (raw !== prevRaw) {
    setPrevRaw(raw);
    // Only a genuinely new id (re)activates the blink — `raw` also goes back
    // to null once the effect below strips it from the URL, and that null
    // transition must NOT clear `activeId` early; only the timer should.
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
