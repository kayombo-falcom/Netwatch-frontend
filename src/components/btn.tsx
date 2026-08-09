export type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type BtnSize = "xs" | "sm" | "md";

const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
const sizeClasses: Record<BtnSize, string> = {
  xs: "px-2 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
};
const variantClasses: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-card text-foreground border border-border hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  outline: "border border-border text-muted-foreground hover:border-primary hover:text-primary bg-transparent",
};

/** The single source of truth for button styling — use this to style a non-<button> element (e.g. a Next.js Link) the same as `Btn` instead of duplicating its classes. */
export const btnClasses = ({
  variant = "primary", size = "sm", className = "",
}: { variant?: BtnVariant; size?: BtnSize; className?: string } = {}) =>
  `${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

export const Btn = ({
  children, variant = "primary", size = "sm", onClick, className = "", disabled = false, type = "button",
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={btnClasses({ variant, size, className })}
  >
    {children}
  </button>
);
