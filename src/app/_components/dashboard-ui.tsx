import { XCircle, AlertTriangle, Info, TrendingUp, ChevronDown } from "lucide-react";
import type { DeviceStatus, Severity } from "@/app/_lib/dashboard-data";

export const StatusDot = ({ status }: { status: DeviceStatus }) => {
  const colors: Record<DeviceStatus, string> = {
    online: "bg-green-500",
    idle: "bg-amber-400",
    blocked: "bg-red-500",
    paused: "bg-slate-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} shrink-0`} />;
};

export const StatusBadge = ({ status }: { status: DeviceStatus }) => {
  const styles: Record<DeviceStatus, string> = {
    online: "bg-green-50 text-green-700 border-green-200",
    idle: "bg-amber-50 text-amber-700 border-amber-200",
    blocked: "bg-red-50 text-red-600 border-red-200",
    paused: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<DeviceStatus, string> = {
    online: "Online", idle: "Idle", blocked: "Blocked", paused: "Paused",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-mono ${styles[status]}`}>
      <StatusDot status={status} />
      {labels[status]}
    </span>
  );
};

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

export const Btn = ({
  children, variant = "primary", size = "sm", onClick, className = "", disabled = false
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "xs" | "sm" | "md";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const base = "inline-flex items-center gap-1.5 font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { xs: "px-2 py-1 text-xs", sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-card text-foreground border border-border hover:bg-muted",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    outline: "border border-border text-muted-foreground hover:border-primary hover:text-primary bg-transparent",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm ${className}`}>{children}</div>
);

export const CardHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between px-5 py-4 border-b border-border">
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 ml-3">{action}</div>}
  </div>
);

export const MetricCard = ({
  label, value, sub, icon, color = "blue", trend
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color?: string; trend?: { val: string; up: boolean };
}) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
    purple: "bg-purple-500/10 text-purple-500",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 ${trend.up ? "text-green-500" : "text-red-500"}`}>
              {trend.up ? <TrendingUp size={10} /> : <ChevronDown size={10} />}
              {trend.val}
            </p>
          )}
        </div>
        <span className={`p-2.5 rounded-lg ${colors[color]}`}>{icon}</span>
      </div>
    </Card>
  );
};

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
