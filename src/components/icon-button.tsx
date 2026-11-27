import { hoverTintClass, type TintColor } from "@/lib/colors";
import { TooltipWrap } from "@/components/tooltip-wrap";

export const IconButton = ({
  icon, title, onClick, color = "muted", className = "", placement = "top",
}: {
  icon: React.ReactNode; title: string; onClick?: () => void;
  color?: TintColor | "destructive"; className?: string; placement?: "top" | "bottom";
}) => (
  <TooltipWrap label={title} placement={placement}>
    <button
      onClick={onClick}
      aria-label={title}
      className={`p-1.5 rounded-md text-muted-foreground/60 transition-colors ${hoverTintClass(color)} ${className}`}
    >
      {icon}
    </button>
  </TooltipWrap>
);
