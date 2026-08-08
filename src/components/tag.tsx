import { tintClass, type TintColor } from "@/lib/colors";

export const Tag = ({
  color, children, bordered = true, className = "",
}: {
  color: TintColor; children: React.ReactNode; bordered?: boolean; className?: string;
}) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${bordered ? "border border-border" : ""} ${tintClass(color)} ${className}`}>
    {children}
  </span>
);
