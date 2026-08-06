import { AlertTriangle, Info } from "lucide-react";
import { Btn } from "@/components/btn";

export const ConfirmDialog = ({
  open, title, message, confirmLabel, variant = "danger", onConfirm, onCancel
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  variant?: "danger" | "primary"; onConfirm: () => void; onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <span className={`p-2 rounded-full ${variant === "danger" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
            {variant === "danger" ? <AlertTriangle size={18} /> : <Info size={18} />}
          </span>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant={variant} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
};
