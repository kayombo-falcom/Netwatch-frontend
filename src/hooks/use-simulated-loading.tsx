"use client";

import { useEffect, useState } from "react";

/**
 * Mock pages have no real fetch to key a loading state off of, so this
 * simulates one — skeletons show for `delay`ms on mount, then real content.
 */
export const useSimulatedLoading = (delay = 700) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return loading;
};
