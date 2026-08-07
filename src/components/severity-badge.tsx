import { XCircle, AlertTriangle, Info } from "lucide-react";
import type { Severity } from "@/app/_lib/dashboard-data";

export const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles: Record<Severity, string> = {
    critical: "bg-tint-navy-bg text-tint-navy-fg border-border",
    warning: "bg-tint-amber-bg text-tint-amber-fg border-border",
    info: "bg-tint-aqua-bg text-tint-aqua-fg border-border",
  };
  const icons: Record<Severity, React.ReactNode> = {
    critical: <XCircle size={12} />,
    warning: <AlertTriangle size={12} />,
    info: <Info size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${styles[severity]} capitalize`}>
      {icons[severity]} {severity}
    </span>
  );
};
