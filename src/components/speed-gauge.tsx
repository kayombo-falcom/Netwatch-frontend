import { describeArc } from "@/lib/gauge-geometry";
import { QualityDot } from "@/components/quality-dot";

/**
 * A circular arc gauge — 270° speedometer-style by default, or a full 360° ring
 * via `sweepDegrees={360}`. Generic over value/max/color so it's reusable for
 * any bounded live metric; pass `valueContent` to show something other than
 * the raw number (e.g. a loading spinner).
 *
 * Value/unit are centered inside the ring; label + quality dot sit below it.
 * The value's font scales both with `size` and with the value's own digit
 * count (a 3-digit number needs a smaller font than a 1-digit one to stay
 * inside the same ring), so it can't outgrow the ring's open middle.
 */
export const SpeedGauge = ({
  value, max, unit, label, icon: Icon, valueContent, dot, color = "var(--chart-1)", size = 140,
  startAngle = 225, sweepDegrees = 270,
}: {
  value: number | null;
  max: number;
  unit?: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  valueContent?: React.ReactNode;
  /** Quality indicator shown next to the label — same `{label, colorClass}` shape as `QualityDot` everywhere else, so the ring's color isn't the only signal. */
  dot?: { label: string; colorClass: string };
  color?: string;
  size?: number;
  startAngle?: number;
  sweepDegrees?: number;
}) => {
  const strokeWidth = size * 0.07;
  const r = size / 2 - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;

  const fraction = value != null && max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  // Baseline scales with the ring itself; the extra digitScale factor shrinks
  // it further for a wider number (e.g. "128" vs "5") so it can't outgrow the
  // ring's open middle regardless of how big the value gets.
  const valueText = valueContent != null ? null : (value != null ? String(value) : "—");
  const digitScale = valueText ? Math.min(1, 2.2 / valueText.length) : 1;
  const valueFontSize = Math.round(size * 0.143 * digitScale);
  const unitFontSize = Math.round(size * 0.071);

  // Track path is fixed (0 to sweepDegrees, never changes) — the fill reveals
  // via stroke-dashoffset, not by recomputing the arc's endpoint angle. Same
  // reason as Speedometer (see its own comment): animating `d` directly means
  // its large-arc-flag flips once the sweep crosses 180°, and browsers don't
  // interpolate between two structurally different arc commands correctly —
  // mid-transition the arc can flash out past the ring.
  const trackPath = describeArc(cx, cy, r, startAngle, startAngle + sweepDegrees);
  const arcLength = 2 * Math.PI * r * (sweepDegrees / 360);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={trackPath} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={trackPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength * (1 - fraction)}
            style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon size={Math.round(size * 0.1)} className="text-muted-foreground/60 mb-0.5" />}
          <div className="font-bold tabular-nums text-foreground leading-none" style={{ fontSize: valueFontSize }}>
            {valueContent ?? valueText}
          </div>
          {unit && <div className="text-muted-foreground/60 mt-0.5" style={{ fontSize: unitFontSize }}>{unit}</div>}
        </div>
      </div>

      {label && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground/60 mt-1.5">
          {label}
          {dot && <QualityDot {...dot} />}
        </div>
      )}
    </div>
  );
};
