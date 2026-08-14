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

const emit = () => listeners.forEach(listener => listener());

const dismiss = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  emit();
};

const push = (variant: ToastVariant, title: string, description?: string, duration = DEFAULT_DURATION) => {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, variant, title, description }];
  emit();
  if (duration > 0) setTimeout(() => dismiss(id), duration);
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
};

/** Fire a toast from anywhere: `toast.success("Policy saved")`. Mount `<Toaster />` once (already in the root layout) to render them. */
export const toast = {
  success: (title: string, description?: string, duration?: number) => push("success", title, description, duration),
  error: (title: string, description?: string, duration?: number) => push("error", title, description, duration),
  warning: (title: string, description?: string, duration?: number) => push("warning", title, description, duration),
  info: (title: string, description?: string, duration?: number) => push("info", title, description, duration),
};
