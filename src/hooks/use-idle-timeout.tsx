"use client";

import { useEffect, useRef, useState } from "react";
import { logout, refreshSession } from "@/lib/auth-client";
import { IDLE_TIMEOUT_MS, IDLE_WARNING_MS } from "@/lib/session-policy";
import { SessionTimeoutDialog } from "@/components/session-timeout-dialog";

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "wheel", "touchstart"] as const;

/** Mount once inside an authenticated layout. Tracks user activity against the
 * idle-session policy and, as the timeout approaches, shows a countdown prompt to
 * stay signed in or log out — mirroring the backend's SECURITY_IDLE_SESSION_TIMEOUT_MINUTES. */
export const IdleSessionGuard = () => {
  const lastActivityRef = useRef(0);
  const warningOpenRef = useRef(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [staying, setStaying] = useState(false);

  useEffect(() => {
    warningOpenRef.current = warningOpen;
  }, [warningOpen]);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    // Ambient activity only resets the clock before the warning appears — once it's
    // up, only an explicit "stay signed in" click should extend the session.
    const registerActivity = () => {
      if (!warningOpenRef.current) lastActivityRef.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, registerActivity, { passive: true }));

    const tick = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        logout();
        return;
      }
      const untilTimeout = IDLE_TIMEOUT_MS - elapsed;
      if (untilTimeout <= IDLE_WARNING_MS) {
        setWarningOpen(true);
        setSecondsRemaining(Math.ceil(untilTimeout / 1000));
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, registerActivity));
      clearInterval(tick);
    };
  }, []);

  const handleStayLoggedIn = async () => {
    setStaying(true);
    const ok = await refreshSession();
    if (ok) {
      lastActivityRef.current = Date.now();
      setWarningOpen(false);
      setStaying(false);
    } else {
      logout();
    }
  };

  return (
    <SessionTimeoutDialog
      open={warningOpen}
      secondsRemaining={secondsRemaining}
      staying={staying}
      onStayLoggedIn={handleStayLoggedIn}
      onLogout={logout}
    />
  );
};
