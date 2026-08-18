"use client";

import { useRef, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToasts } from "@/hooks/use-toasts";
import { toastStore, type ToastItem, type ToastVariant } from "@/lib/toast-store";

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

/** How far a toast must be dragged horizontally before release dismisses it. */
const SWIPE_DISMISS_PX = 80;
/** How far it can be dragged before fading to fully transparent. */
const SWIPE_FADE_PX = 200;

/** A single toast — hovering it pauses its auto-dismiss countdown, and it can be
 * dragged horizontally with the cursor (or a finger) to dismiss it early. */
const ToastCard = ({ toast }: { toast: ToastItem }) => {
  const Icon = VARIANT_ICON[toast.variant];
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX - dragX;
    setDragging(true);
    toastStore.pause(toast.id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    if (Math.abs(dragX) > SWIPE_DISMISS_PX) {
      toastStore.dismiss(toast.id);
    } else {
      setDragX(0);
      toastStore.resume(toast.id);
    }
  };

  return (
    <div
      role="status"
      onPointerEnter={() => toastStore.pause(toast.id)}
      onPointerLeave={() => { if (!dragging) toastStore.resume(toast.id); }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        transform: `translateX(${dragX}px)`,
        opacity: Math.max(1 - Math.abs(dragX) / SWIPE_FADE_PX, 0.15),
        transition: dragging ? "none" : "transform 200ms ease, opacity 200ms ease",
        touchAction: "pan-y",
      }}
      className={`animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2 border rounded-lg shadow-lg p-2.5 cursor-grab active:cursor-grabbing select-none ${VARIANT_CLASS[toast.variant]}`}
    >
      <Icon size={14} className="shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{toast.title}</p>
        {toast.description && <p className="text-[11px] mt-0.5 opacity-80">{toast.description}</p>}
      </div>
      <button
        onClick={() => toastStore.dismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 hover:bg-current/10 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

/** Renders the active toast stack. Mount once — call `toast.success()`/`.error()`/`.warning()`/`.info()` from anywhere to push one. */
export const Toaster = () => {
  const toasts = useToasts();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-16 z-[100] flex flex-col gap-1.5 w-full max-w-xs">
      {toasts.map(t => <ToastCard key={t.id} toast={t} />)}
    </div>
  );
};
