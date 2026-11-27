import { TrendingUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/card";
import { IconSwatch } from "@/components/icon-swatch";
import { TINT, type TintColor } from "@/lib/colors";

/** Picks a smaller value size as the string gets longer, so labels like AP names don't overflow the card. */
const valueSizeClass = (value: string) => {
  if (value.length > 14) return "text-base";
  if (value.length > 9) return "text-lg";
  return "text-2xl";
};

export const MetricCard = ({
  label, value, sub, icon, color = "navy", trend
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color?: TintColor; trend?: { val: string; up: boolean };
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{label}</p>
          <p className={`font-bold text-foreground mt-1 tabular-nums truncate ${valueSizeClass(value)}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 truncate ${trend.up ? TINT.teal.fg : TINT.navy.fg}`}>
              {trend.up ? <TrendingUp size={10} className="shrink-0" /> : <ChevronDown size={10} className="shrink-0" />}
              <span className="truncate">{trend.val}</span>
            </p>
          )}
        </div>
        <IconSwatch color={color} className="shrink-0">{icon}</IconSwatch>
      </div>
    </Card>
  );
};
