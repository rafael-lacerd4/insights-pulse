import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
  delay?: number;
  trend?: { value: string; direction: "up" | "down" | "flat"; positive?: boolean };
  onClick?: () => void;
}

const toneMap = {
  default: "from-muted to-muted",
  primary: "from-primary/30 to-accent/30",
  success: "from-success/30 to-success/10",
  warning: "from-warning/30 to-warning/10",
  danger: "from-danger/30 to-danger/10",
};

const iconTone = {
  default: "text-muted-foreground bg-muted",
  primary: "text-primary bg-primary/15",
  success: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/15",
  warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/15",
  danger: "text-[hsl(var(--danger))] bg-[hsl(var(--danger))]/15",
};

export const KpiCard = ({ label, value, hint, icon: Icon, tone = "default", delay = 0, trend, onClick }: Props) => {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendClass = trend
    ? trend.positive === undefined
      ? "text-muted-foreground bg-muted/40 border-border"
      : trend.positive
      ? "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30"
      : "text-danger bg-danger/10 border-danger/30"
    : "";
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card-hover group relative overflow-hidden rounded-xl p-5 animate-fade-in-up",
        onClick && "cursor-pointer"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("absolute -top-12 -right-12 h-36 w-36 rounded-full blur-3xl opacity-50 bg-gradient-to-br transition-opacity group-hover:opacity-80", toneMap[tone])} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-2xl lg:text-[28px] font-display font-semibold leading-tight tabular-nums">{value}</p>
          {hint && <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{hint}</p>}
          {trend && (
            <div className={cn("mt-3 chip", trendClass)}>
              <TrendIcon className="h-3 w-3" />
              <span className="tabular-nums">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl shrink-0 ring-1 transition-transform group-hover:scale-110 group-hover:rotate-3", iconTone[tone], "ring-border/60")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};