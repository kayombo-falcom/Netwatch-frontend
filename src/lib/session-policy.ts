/** Must match Django's SECURITY_IDLE_SESSION_TIMEOUT_MINUTES. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

/** How long before the idle timeout to warn the user, offering to stay signed in. */
export const IDLE_WARNING_MS = 60 * 1000;
