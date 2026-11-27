import { Minus, X } from "lucide-react";
import { IconButton } from "@/components/icon-button";

export const WindowControls = ({
  onMinimize, onClose, className = "",
}: {
  onMinimize: () => void; onClose: () => void; className?: string;
}) => (
  <div className={`flex items-center gap-0.5 ${className}`}>
    <IconButton icon={<Minus size={14} />} title="Minimize" color="muted" onClick={onMinimize} />
    <IconButton icon={<X size={14} />} title="Close" color="destructive" onClick={onClose} />
  </div>
);
