export const TooltipWrap = ({
  label, children, className = "", placement = "top", align = "center",
}: {
  label: string; children: React.ReactNode; className?: string;
  placement?: "top" | "bottom"; align?: "center" | "end";
}) => (
  <span className={`relative inline-flex group/tooltip ${className}`}>
    {children}
    <span
      role="tooltip"
      className={`pointer-events-none absolute whitespace-nowrap rounded-md bg-popover text-popover-foreground border border-border px-2 py-1 text-[11px] font-medium shadow-sm opacity-0 scale-95 transition-all duration-150 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 z-20 ${placement === "bottom" ? "-bottom-1.5 translate-y-full" : "-top-1.5 -translate-y-full"} ${align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"}`}
    >
      {label}
    </span>
  </span>
);
