export const Modal = ({
  open, onClose, children, className = "", position = "center",
}: {
  open: boolean; onClose: () => void; children: React.ReactNode; className?: string;
  position?: "center" | "right";
}) => {
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm ${position === "center" ? "items-center justify-center" : "justify-end"}`}
      onClick={onClose}
    >
      <div
        className={`bg-card text-card-foreground shadow-2xl animate-fade-in ${position === "center" ? "rounded-xl w-full mx-4" : "h-full w-full"} ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
