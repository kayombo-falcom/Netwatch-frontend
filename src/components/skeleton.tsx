import { Card } from "@/components/card";
import { Skeleton } from "@/components/ui/skeleton";

export { Skeleton };

export const SkeletonText = ({ className = "", width = "100%" }: { className?: string; width?: string }) => (
  <Skeleton className={`h-3 ${className}`} style={{ width }} />
);

export const SkeletonCircle = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <Skeleton className={`rounded-full shrink-0 ${className}`} style={{ width: size, height: size }} />
);

/** Skeleton rows for a `<table>` body — mirrors the column count/widths of the real table so there's no layout shift once data loads. */
export const SkeletonTableRows = ({ columns, rows = 5 }: { columns: number; rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r}>
        {Array.from({ length: columns }).map((__, c) => (
          <td key={c} className="px-4 py-3">
            <Skeleton className="h-3.5" style={{ width: c === 0 ? "70%" : "50%" }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/** Placeholder matching `MetricCard`'s shape: label, big value, sub line, icon swatch. */
export const SkeletonMetricCard = () => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-2 w-2/3">
        <SkeletonText width="60%" />
        <Skeleton className="h-6 w-1/2" />
        <SkeletonText width="80%" />
      </div>
      <SkeletonCircle size={36} className="rounded-lg" />
    </div>
  </Card>
);

/** Placeholder for chart regions (ResponsiveContainer areas). Pass `className` with a responsive height (e.g. "h-[220px] xl:h-[300px]") to match a chart that grows on wider screens; falls back to a fixed `height` in px otherwise. */
export const SkeletonChart = ({ height = 220, className }: { height?: number; className?: string }) => (
  <Skeleton className={`w-full rounded-lg ${className ?? ""}`} style={className ? undefined : { height }} />
);
