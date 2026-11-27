export const FilterPill = ({
  active, onClick, children, className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"} ${className}`}
  >
    {children}
  </button>
);
