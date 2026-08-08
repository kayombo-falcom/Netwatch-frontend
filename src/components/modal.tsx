export const Modal = ({
  open, onClose, children, className = "",
}: {
  open: boolean; onClose: () => void; children: React.ReactNode; className?: string;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-card text-card-foreground rounded-xl shadow-2xl w-full mx-4 animate-fade-in ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
