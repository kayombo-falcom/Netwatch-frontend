import { AlertTriangle, Info } from "lucide-react";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { tintClass } from "@/lib/colors";

export const ConfirmDialog = ({
  open, title, message, confirmLabel, variant = "danger", onConfirm, onCancel
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  variant?: "danger" | "primary"; onConfirm: () => void; onCancel: () => void;
}) => (
  <Modal open={open} onClose={onCancel} className="max-w-sm p-6">
    <div className="flex items-center gap-3 mb-3">
      <span className={`p-2 rounded-full ${variant === "danger" ? "bg-destructive/10 text-destructive" : tintClass("aqua")}`}>
        {variant === "danger" ? <AlertTriangle size={18} /> : <Info size={18} />}
      </span>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground mb-5">{message}</p>
    <div className="flex gap-2 justify-end">
      <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      <Btn variant={variant} onClick={onConfirm}>{confirmLabel}</Btn>
    </div>
  </Modal>
);
