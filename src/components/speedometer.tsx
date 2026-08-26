import { useId } from "react";
import { describeArc, polarToCartesian, valueToAngle } from "@/lib/gauge-geometry";

const START_ANGLE = 225;
const SWEEP_DEGREES = 270;

/** Non-uniform scale so low speeds (typical home broadband) get most of the dial's resolution. */
export const MBPS_BREAKPOINTS = [0, 5, 10, 50, 100, 250, 500, 750, 1000];

/** Needle drawn pointing straight up (12 o'clock); rotated into position via CSS transform. */
function needlePath(cx: number, cy: number, tipRadius: number, baseHalfWidth: number) {
  const tip = { x: cx, y: cy - tipRadius };
  const base1 = { x: cx + baseHalfWidth, y: cy };
  const base2 = { x: cx - baseHalfWidth, y: cy };
  return `M ${base1.x} ${base1.y} L ${tip.x} ${tip.y} L ${base2.x} ${base2.y} Z`;
}

/**
 * A speedtest.net-style needle dial: a non-linear tick scale, a gradient arc
 * filled from rest up to the needle, and a tapered needle pointing at the
 * live value. Reusable for any breakpoint-scaled live metric (defaults to a
 * 0–1000 Mbps scale) — pass `icon`/`label`/`unit` to relabel it.
 *
 * The fill arc's `d` never changes — only `stroke-dashoffset` animates — and
 * the needle only ever rotates. Animating the arc's endpoint directly (a
 * changing `d`) looks fine most of the time, but once the sweep crosses 180°
 * its `large-arc-flag` flips, and browsers don't interpolate between two
 * structurally different arc commands correctly — mid-transition the arc can
 * flash out to a wildly wrong shape that appears to swing outside the ring.
 */
export const Speedometer = ({
  value, breakpoints = MBPS_BREAKPOINTS, unit = "Mbps", label, icon: Icon,
  size = 200, colorFrom = "var(--chart-3)", colorTo = "var(--chart-4)",
}: {
  value: number | null;
  breakpoints?: number[];
  unit?: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  size?: number;
  colorFrom?: string;
  colorTo?: string;
}) => {
  const gradientId = useId();
  const strokeWidth = size * 0.075;
  const r = size / 2 - strokeWidth;
  const cx = size / 2;
  const cy = size / 2;

  const clampedValue = value ?? breakpoints[0];
  const needleAngle = valueToAngle(clampedValue, breakpoints, START_ANGLE, SWEEP_DEGREES);
  const fraction = value != null ? (needleAngle - START_ANGLE) / SWEEP_DEGREES : 0;

  const trackPath = describeArc(cx, cy, r, START_ANGLE, START_ANGLE + SWEEP_DEGREES);
  const arcLength = 2 * Math.PI * r * (SWEEP_DEGREES / 360);
  const needle = needlePath(cx, cy, r * 0.8, size * 0.022);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradientId} x1={cx} y1={cy + r} x2={cx} y2={cy - r} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>

          <path d={trackPath} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={trackPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength * (1 - fraction)}
            style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
          />

          {breakpoints.map((bp, i) => {
            const angle = START_ANGLE + i * (SWEEP_DEGREES / (breakpoints.length - 1));
            const pos = polarToCartesian(cx, cy, r - strokeWidth * 1.3, angle);
            return (
              <text
                key={bp}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground/60 font-medium"
                style={{ fontSize: size * 0.065 }}
              >
                {bp}
              </text>
            );
          })}

          <path
            d={needle}
            fill="var(--muted-foreground)"
            style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform 0.4s ease-out" }}
          />
          <circle cx={cx} cy={cy} r={size * 0.045} fill="var(--muted-foreground)" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        {Icon && <Icon size={14} className="text-muted-foreground/60" />}
        <span className="text-xl font-bold tabular-nums text-foreground">{value ?? "—"}</span>
        <span className="text-xs text-muted-foreground/60">{unit}</span>
      </div>
      {label && <div className="text-xs text-muted-foreground/60 mt-0.5">{label}</div>}
    </div>
  );
};
