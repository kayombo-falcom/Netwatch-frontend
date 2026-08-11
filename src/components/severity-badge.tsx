import { XCircle, AlertTriangle, Info } from "lucide-react";
import type { Severity } from "@/app/_lib/dashboard-data";
import { Tag } from "@/components/tag";
import { SEVERITY_TINT } from "@/lib/colors";

const ICONS: Record<Severity, React.ReactNode> = {
  critical: <XCircle size={12} />,
  warning: <AlertTriangle size={12} />,
  info: <Info size={12} />,
};

export const SeverityBadge = ({ severity }: { severity: Severity }) => (
  <Tag color={SEVERITY_TINT[severity]} className="capitalize">
    {ICONS[severity]} {severity}
  </Tag>
);
