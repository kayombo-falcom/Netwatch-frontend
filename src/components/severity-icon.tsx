import { XCircle, AlertTriangle, Info } from "lucide-react";
import type { Severity } from "@/app/_lib/dashboard-data";
import { STATUS, SEVERITY_STATUS } from "@/lib/colors";

const ICONS: Record<Severity, React.ComponentType<{ size?: number }>> = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const SeverityIcon = ({ severity, size = 14, className = "" }: { severity: Severity; size?: number; className?: string }) => {
  const Icon = ICONS[severity];
  return (
    <span className={`shrink-0 ${STATUS[SEVERITY_STATUS[severity]].text} ${className}`}>
      <Icon size={size} />
    </span>
  );
};
