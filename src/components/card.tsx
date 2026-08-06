export const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm ${className}`}>{children}</div>
);
