export const Card = ({ children, className = "", onClick, ref }: { children: React.ReactNode; className?: string; onClick?: () => void; ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} onClick={onClick} className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm ${className}`}>{children}</div>
);
