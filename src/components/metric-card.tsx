import { TrendingUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/card";
import { IconSwatch } from "@/components/icon-swatch";
import { TINT, type TintColor } from "@/lib/colors";

export const MetricCard = ({
  label, value, sub, icon, color = "navy", trend
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color?: TintColor; trend?: { val: string; up: boolean };
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 ${trend.up ? TINT.teal.fg : TINT.navy.fg}`}>
              {trend.up ? <TrendingUp size={10} /> : <ChevronDown size={10} />}
              {trend.val}
            </p>
          )}
        </div>
        <IconSwatch color={color}>{icon}</IconSwatch>
      </div>
    </Card>
  );
};
