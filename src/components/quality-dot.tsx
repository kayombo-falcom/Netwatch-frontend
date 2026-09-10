import { TooltipWrap } from "@/components/tooltip-wrap";

// Small colored dot; hover reveals what the color means.
export const QualityDot = ({ label, colorClass }: { label: string; colorClass: string }) => (
  <TooltipWrap label={label}>
    <span className={`inline-block w-2 h-2 rounded-full ${colorClass}`} />
  </TooltipWrap>
);
