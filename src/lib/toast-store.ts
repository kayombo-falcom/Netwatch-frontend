export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
};

const DEFAULT_DURATION = 4000;

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

/** Tracks each toast's auto-dismiss timer so it can be paused (hover) and resumed
 * without losing the time already elapsed. */
type TimerEntry = { timeoutId: ReturnType<typeof setTimeout> | null; remaining: number; startedAt: number };
const timers = new Map<string, TimerEntry>();

const emit = () => listeners.forEach(listener => listener());

const clearScheduled = (id: string) => {
  const timer = timers.get(id);
  if (timer?.timeoutId) clearTimeout(timer.timeoutId);
};

const schedule = (id: string, ms: number) => {
  clearScheduled(id);
  if (ms <= 0) {
    timers.delete(id);
    return;
  }
  const timeoutId = setTimeout(() => dismiss(id), ms);
  timers.set(id, { timeoutId, remaining: ms, startedAt: Date.now() });
};

const dismiss = (id: string) => {
  clearScheduled(id);
  timers.delete(id);
  toasts = toasts.filter(t => t.id !== id);
  emit();
};

/** Stops the countdown where it stands — e.g. while the cursor is hovering the toast. */
const pause = (id: string) => {
  const timer = timers.get(id);
  if (!timer || !timer.timeoutId) return;
  clearTimeout(timer.timeoutId);
  const elapsed = Date.now() - timer.startedAt;
  timers.set(id, { timeoutId: null, remaining: Math.max(timer.remaining - elapsed, 0), startedAt: timer.startedAt });
};

/** Restarts the countdown from wherever `pause` left it. */
const resume = (id: string) => {
  const timer = timers.get(id);
  if (!timer || timer.timeoutId) return;
  schedule(id, timer.remaining);
};

const push = (variant: ToastVariant, title: string, description?: string, duration = DEFAULT_DURATION) => {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, variant, title, description }];
  emit();
  schedule(id, duration);
  return id;
};

/** Module-level pub-sub — lets `useToasts()` subscribe from React while `toast.*()` can be called from anywhere, including outside components. */
export const toastStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
  dismiss,
  pause,
  resume,
};

/** Fire a toast from anywhere: `toast.success("Policy saved")`. Mount `<Toaster />` once (already in the root layout) to render them. */
export const toast = {
  success: (title: string, description?: string, duration?: number) => push("success", title, description, duration),
  error: (title: string, description?: string, duration?: number) => push("error", title, description, duration),
  warning: (title: string, description?: string, duration?: number) => push("warning", title, description, duration),
  info: (title: string, description?: string, duration?: number) => push("info", title, description, duration),
};
