import { TooltipWrap } from "@/components/tooltip-wrap";

/** A small colored status dot; hover reveals what the color means. Reusable for any at-a-glance quality indicator. */
export const QualityDot = ({ label, colorClass }: { label: string; colorClass: string }) => (
  <TooltipWrap label={label}>
    <span className={`inline-block w-2 h-2 rounded-full ${colorClass}`} />
  </TooltipWrap>
);
