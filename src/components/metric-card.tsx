import { TrendingUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/card";

export const MetricCard = ({
  label, value, sub, icon, color = "blue", trend
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color?: string; trend?: { val: string; up: boolean };
}) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
    purple: "bg-purple-500/10 text-purple-500",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 ${trend.up ? "text-green-500" : "text-red-500"}`}>
              {trend.up ? <TrendingUp size={10} /> : <ChevronDown size={10} />}
              {trend.val}
            </p>
          )}
        </div>
        <span className={`p-2.5 rounded-lg ${colors[color]}`}>{icon}</span>
      </div>
    </Card>
  );
};
