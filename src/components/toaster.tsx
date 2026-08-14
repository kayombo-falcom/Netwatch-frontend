"use client";

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToasts } from "@/hooks/use-toasts";
import { toastStore, type ToastVariant } from "@/lib/toast-store";

const VARIANT_ICON: Record<ToastVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

/** Light tinted surface per variant — success reads green, error reads red, in both themes. */
const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: "bg-status-online/10 border-status-online/30 text-status-online",
  error: "bg-destructive/10 border-destructive/30 text-destructive",
  warning: "bg-status-warning/10 border-status-warning/30 text-status-warning",
  info: "bg-tint-aqua-bg border-tint-aqua-fg/30 text-tint-aqua-fg",
};

/** Renders the active toast stack. Mount once — call `toast.success()`/`.error()`/`.warning()`/`.info()` from anywhere to push one. */
export const Toaster = () => {
  const toasts = useToasts();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-16 z-[100] flex flex-col gap-1.5 w-full max-w-xs">
      {toasts.map(t => {
        const Icon = VARIANT_ICON[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={`animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2 border rounded-lg shadow-lg p-2.5 ${VARIANT_CLASS[t.variant]}`}
          >
            <Icon size={14} className="shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{t.title}</p>
              {t.description && <p className="text-[11px] mt-0.5 opacity-80">{t.description}</p>}
            </div>
            <button
              onClick={() => toastStore.dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 hover:bg-current/10 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
