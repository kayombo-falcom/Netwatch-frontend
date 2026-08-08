import { tintClass, type TintColor } from "@/lib/colors";

export const IconSwatch = ({
  color, children, className = "",
}: {
  color: TintColor; children: React.ReactNode; className?: string;
}) => (
  <span className={`inline-flex p-2.5 rounded-lg ${tintClass(color)} ${className}`}>
    {children}
  </span>
);
