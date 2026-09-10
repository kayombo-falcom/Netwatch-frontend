import { describeArc } from "@/lib/gauge-geometry";
import { QualityDot } from "@/components/quality-dot";

// Value's font scales with both size and digit count, so it can't outgrow the ring's open middle.
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
  // Same shape as QualityDot everywhere else, so the ring's color isn't the only signal.
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

  // digitScale shrinks the font further for wider numbers so it can't outgrow the ring.
  const valueText = valueContent != null ? null : (value != null ? String(value) : "—");
  const digitScale = valueText ? Math.min(1, 2.2 / valueText.length) : 1;
  const valueFontSize = Math.round(size * 0.143 * digitScale);
  const unitFontSize = Math.round(size * 0.071);

  // Fill animates via stroke-dashoffset, not by changing the arc's d — animating d directly glitches past 180° (see Speedometer).
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
