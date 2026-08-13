export const SegmentedToggle = ({
  on, onChange, label,
}: { on: boolean; onChange?: () => void; label?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex w-16 h-6.5 rounded-lg border p-0.5 shrink-0 transition-colors duration-200 ${on ? "bg-primary/10 border-primary/30" : "bg-muted border-border"}`}
  >
    <span
      className={`absolute top-0.5 bottom-0.5 left-0.5 flex w-[calc(50%-2px)] items-center justify-center rounded-md text-xs font-medium shadow-sm transition-[transform,background-color] duration-200 ease-out ${on ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-background"}`}
      style={{ transform: on ? "translateX(100%)" : "translateX(0)" }}
    >
      {on ? "On" : "Off"}
    </span>
  </button>
);
