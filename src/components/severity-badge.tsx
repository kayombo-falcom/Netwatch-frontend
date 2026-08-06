import { XCircle, AlertTriangle, Info } from "lucide-react";
import type { Severity } from "@/app/_lib/dashboard-data";

export const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles: Record<Severity, string> = {
    critical: "bg-red-50 text-red-600 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
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
