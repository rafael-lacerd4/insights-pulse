import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
  delay?: number;
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

export const KpiCard = ({ label, value, hint, icon: Icon, tone = "default", delay = 0 }: Props) => (
  <div
    className="glass-card relative overflow-hidden rounded-xl p-5 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-50 bg-gradient-to-br", toneMap[tone])} />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="mt-2 text-2xl lg:text-[26px] font-display font-semibold leading-tight">{value}</p>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className={cn("p-2.5 rounded-lg shrink-0", iconTone[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);