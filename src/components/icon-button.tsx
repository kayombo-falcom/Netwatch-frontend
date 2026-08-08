import { hoverTintClass, type TintColor } from "@/lib/colors";

export const IconButton = ({
  icon, title, onClick, color = "muted", className = "",
}: {
  icon: React.ReactNode; title: string; onClick?: () => void;
  color?: TintColor | "destructive"; className?: string;
}) => (
  <span className="relative inline-flex group/tooltip">
    <button
      onClick={onClick}
      aria-label={title}
      className={`p-1.5 rounded text-muted-foreground/60 transition-colors ${hoverTintClass(color)} ${className}`}
    >
      {icon}
    </button>
    <span
      role="tooltip"
      className="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-popover text-popover-foreground border border-border px-2 py-1 text-[11px] font-medium shadow-sm opacity-0 scale-95 transition-all duration-150 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 z-20"
    >
      {title}
    </span>
  </span>
);
