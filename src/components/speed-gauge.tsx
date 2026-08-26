import { describeArc } from "@/lib/gauge-geometry";

/**
 * A circular arc gauge — 270° speedometer-style by default, or a full 360° ring
 * via `sweepDegrees={360}`. Generic over value/max/color/content so it's reusable
 * for any bounded live metric; pass `children` to fully customize what's shown
 * at the center instead of the default number+unit readout.
 */
export const SpeedGauge = ({
  value, max, unit, label, color = "var(--chart-1)", size = 140,
  startAngle = 225, sweepDegrees = 270, children,
}: {
  value: number | null;
  max: number;
  unit?: string;
  label?: string;
  color?: string;
  size?: number;
  startAngle?: number;
  sweepDegrees?: number;
  children?: React.ReactNode;
}) => {
  const strokeWidth = size * 0.07;
  const r = size / 2 - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;

  const fraction = value != null && max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const valueAngle = startAngle + fraction * sweepDegrees;

  const trackPath = describeArc(cx, cy, r, startAngle, startAngle + sweepDegrees);
  const valuePath = describeArc(cx, cy, r, startAngle, valueAngle);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={trackPath} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} strokeLinecap="round" />
          {fraction > 0 && (
            <path
              d={valuePath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ transition: "d 0.5s ease-out" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children ?? (
            <>
              <div className="text-xl font-bold tabular-nums text-foreground">{value ?? "—"}</div>
              <div className="text-[10px] text-muted-foreground/60">{unit}</div>
            </>
          )}
        </div>
      </div>
      {label && <div className="text-xs text-muted-foreground/60 mt-1">{label}</div>}
    </div>
  );
};
