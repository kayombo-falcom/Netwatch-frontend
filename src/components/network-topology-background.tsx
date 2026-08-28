"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

type Point = [number, number];

// Deterministic PRNG (mulberry32) so the "random" scatter below is identical
// on the server and the client — a real Math.random() here would make the
// server-rendered graph and the client's first paint disagree.
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function scatterPoints(count: number, width: number, height: number, seed: number): Point[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => [Math.round(rand() * width), Math.round(rand() * height)]);
}

/** Connects each point to its `k` nearest neighbors — a cheap stand-in for Delaunay triangulation that still reads as an organic "plexus" mesh. */
function nearestNeighborEdges(points: Point[], k: number): [number, number][] {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  points.forEach((p, i) => {
    const nearest = points
      .map((q, j) => ({ j, distSq: (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 }))
      .filter(x => x.j !== i)
      .sort((a, b) => a.distSq - b.distSq)
      .slice(0, k);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(i < j ? [i, j] : [j, i]);
    }
  });
  return edges;
}

function makeDust(count: number, width: number, height: number, seed: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: Math.round(rand() * width),
    y: Math.round(rand() * height),
    r: Math.round((0.6 + rand() * 1) * 10) / 10,
    o: Math.round((0.15 + rand() * 0.35) * 100) / 100,
  }));
}

const VIEW_W = 1200;
const VIEW_H = 800;

// Dim, dense backdrop web — the center is left to the radial mask below to
// fade out, since the login card sits there.
const BACK_NODES = scatterPoints(200, VIEW_W, VIEW_H, 7);
const BACK_EDGES = nearestNeighborEdges(BACK_NODES, 5);

// Fewer, brighter "hub" points scattered across the frame, each glowing —
// the plexus effect's focal points.
const FRONT_NODES = scatterPoints(36, VIEW_W, VIEW_H, 99);
const FRONT_EDGES = nearestNeighborEdges(FRONT_NODES, 4);

const DUST = makeDust(90, VIEW_W, VIEW_H, 42);

function edgePath(nodes: Point[], edge: [number, number]) {
  const [a, b] = edge;
  return `M ${nodes[a][0]} ${nodes[a][1]} L ${nodes[b][0]} ${nodes[b][1]}`;
}

// Reads prefers-reduced-motion through useSyncExternalStore rather than an
// effect + setState, so the server snapshot (motion off) and the client's
// first paint can never disagree — React reconciles the real value itself.
function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
const getReducedMotionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionServerSnapshot = () => true;

function useMotionAllowed() {
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
  return !reduced;
}

/**
 * Glowing "plexus" network graph behind the login card — a dim, dense web of
 * nearest-neighbor-connected points with a sparser layer of bright, glowing
 * hub points on top, plus drifting dust specks. Two depths drift toward the
 * cursor at different rates for a subtle parallax feel; hubs pulse and a few
 * packets travel along the wires. All motion is skipped under
 * prefers-reduced-motion.
 */
export function NetworkTopologyBackground() {
  const backRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);
  const motionOK = useMotionAllowed();

  useEffect(() => {
    if (!motionOK) return;

    let frame = 0;
    const handleMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        backRef.current?.style.setProperty("transform", `translate3d(${nx * 10}px, ${ny * 10}px, 0)`);
        frontRef.current?.style.setProperty("transform", `translate3d(${nx * -22}px, ${ny * -22}px, 0)`);
      });
    };

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, [motionOK]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15] dark:opacity-[0.25]">
      <style>{`
        @keyframes ntb-blink { 0%, 85%, 100% { opacity: 1; } 92% { opacity: 0.25; } }
        @keyframes ntb-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes ntb-twinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 1; } }
      `}</style>

      {/* Faint scanline texture, echoing a data readout */}
      <div
        className="absolute inset-0 text-foreground"
        style={{ opacity: 0.03, backgroundImage: "repeating-linear-gradient(90deg, currentColor 0, currentColor 1px, transparent 1px, transparent 48px)" }}
      />

      <svg
        ref={backRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-foreground/15 transition-transform duration-500 ease-out"
      >
        {BACK_EDGES.map(([a, b], i) => (
          <line key={i} x1={BACK_NODES[a][0]} y1={BACK_NODES[a][1]} x2={BACK_NODES[b][0]} y2={BACK_NODES[b][1]} stroke="currentColor" strokeWidth={1} />
        ))}
        {DUST.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="currentColor"
            opacity={d.o}
            style={motionOK ? { animation: `ntb-twinkle ${4 + (i % 6)}s ease-in-out ${i * 0.2}s infinite` } : undefined}
          />
        ))}
        {BACK_NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={2.5}
            fill="currentColor"
            style={motionOK ? { animation: `ntb-blink ${5 + (i % 5)}s ease-in-out ${i * 0.3}s infinite` } : undefined}
          />
        ))}
        {motionOK && BACK_EDGES.filter((_, i) => i % 7 === 1).map((edge, k) => (
          <circle key={`flow-${k}`} r={2} className="text-chart-3/60" fill="currentColor">
            <animateMotion dur={`${6 + k}s`} begin={`${k * 0.7}s`} repeatCount="indefinite" path={edgePath(BACK_NODES, edge)} />
          </circle>
        ))}
      </svg>

      <svg
        ref={frontRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out"
      >
        {FRONT_EDGES.map(([a, b], i) => (
          <line key={i} x1={FRONT_NODES[a][0]} y1={FRONT_NODES[a][1]} x2={FRONT_NODES[b][0]} y2={FRONT_NODES[b][1]} stroke="currentColor" strokeWidth={1.25} className="text-chart-3/25" />
        ))}
        {FRONT_NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 4 === 0 ? 4.5 : 3}
            fill="currentColor"
            className={i % 3 === 0 ? "text-chart-2/80" : "text-chart-3/80"}
            style={{
              filter: "drop-shadow(0 0 6px currentColor)",
              ...(motionOK ? { animation: `ntb-pulse ${2.5 + (i % 3) * 0.6}s ease-in-out ${i * 0.35}s infinite` } : {}),
            }}
          />
        ))}
        {motionOK && FRONT_EDGES.filter((_, i) => i % 2 === 0).map((edge, k) => (
          <circle key={`flow-${k}`} r={2.5} className="text-chart-2/90" fill="currentColor" style={{ filter: "drop-shadow(0 0 4px currentColor)" }}>
            <animateMotion dur={`${5 + k * 1.3}s`} begin={`${k * 0.9}s`} repeatCount="indefinite" path={edgePath(FRONT_NODES, edge)} />
          </circle>
        ))}
      </svg>
    </div>
  );
}
