import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  height?: number;
}
export const ChartCard = ({ title, subtitle, className, children, height = 320 }: Props) => (
  <div className={cn("glass-card rounded-xl p-5 animate-fade-in-up", className)}>
    <div className="flex items-baseline justify-between gap-3 mb-4">
      <div>
        <h3 className="font-display font-semibold text-base">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);