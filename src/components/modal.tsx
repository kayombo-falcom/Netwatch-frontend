import { Maximize2 } from "lucide-react";
import { WindowControls } from "@/components/window-controls";
import { tintClass } from "@/lib/colors";

export const Modal = ({
  open, onClose, children, className = "", position = "center", title,
  minimizable = false, minimized = false, onMinimize, onRestore,
}: {
  open: boolean; onClose: () => void; children: React.ReactNode; className?: string;
  position?: "center" | "right"; title?: string;
  minimizable?: boolean; minimized?: boolean; onMinimize?: () => void; onRestore?: () => void;
}) => {
  if (!open) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm ${position === "center" ? "items-center justify-center" : "justify-end"} ${minimized ? "hidden" : ""}`}
        onClick={onClose}
      >
        <div
          className={`relative bg-card text-card-foreground shadow-2xl animate-fade-in ${position === "center" ? "rounded-xl w-full mx-4" : "h-full w-full"} ${className}`}
          onClick={e => e.stopPropagation()}
        >
          {minimizable && (
            <WindowControls className="absolute top-3 right-3 z-10" onMinimize={() => onMinimize?.()} onClose={onClose} />
          )}
          {children}
        </div>
      </div>

      {minimizable && minimized && (
        <button
          onClick={() => onRestore?.()}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 min-w-60 rounded-xl border border-border bg-card px-4 py-3.5 shadow-2xl animate-fade-in hover:bg-muted transition-colors"
        >
          <span className={`p-2 rounded-full shrink-0 ${tintClass("teal")}`}><Maximize2 size={16} /></span>
          <span className="text-sm font-semibold text-foreground truncate">{title ?? "Restore"}</span>
        </button>
      )}
    </>
  );
};
