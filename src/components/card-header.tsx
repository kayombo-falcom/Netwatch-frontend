export const CardHeader = ({
  title, subtitle, action, divider = true,
}: { title: string; subtitle?: string; action?: React.ReactNode; divider?: boolean }) => (
  <div className={`flex items-start justify-between gap-3 px-5 py-4 ${divider ? "border-b border-border" : ""}`}>
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
