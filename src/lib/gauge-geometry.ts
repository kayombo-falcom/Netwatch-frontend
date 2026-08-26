/** Shared polar-coordinate math for arc/needle gauges (SpeedGauge, Speedometer). */

/** 0deg = 12 o'clock, increasing clockwise — matches SVG's default y-down orientation. */
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

export function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // A full-circle arc (sweep === 360) has identical start/end points, which SVG renders as
  // nothing — nudge just short of a full turn so the track/fill always stays visible.
  const clampedEnd = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, clampedEnd);
  const largeArc = clampedEnd - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Maps a value to an angle along a piecewise-linear (non-uniform) scale, so
 * breakpoints like [0, 5, 10, 50, 100, 250, 500, 750, 1000] each get an equal
 * angular slice — giving low speeds far more needle resolution than a plain
 * linear 0..max scale would.
 */
export function valueToAngle(value: number, breakpoints: number[], startAngle: number, sweepDegrees: number) {
  const last = breakpoints.length - 1;
  const clamped = Math.min(Math.max(value, breakpoints[0]), breakpoints[last]);
  const anglePerSegment = sweepDegrees / last;

  let segment = last - 1;
  for (let i = 0; i < last; i++) {
    if (clamped <= breakpoints[i + 1]) { segment = i; break; }
  }

  const segStart = breakpoints[segment];
  const segEnd = breakpoints[segment + 1];
  const segFraction = segEnd === segStart ? 0 : (clamped - segStart) / (segEnd - segStart);
  return startAngle + segment * anglePerSegment + segFraction * anglePerSegment;
}
