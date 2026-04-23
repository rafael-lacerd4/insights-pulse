import { type LucideIcon } from "lucide-react";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}
export const SectionHeader = ({ eyebrow, title, description, icon: Icon, actions }: Props) => (
  <div className="mb-6 animate-fade-in-up">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-semibold">{eyebrow}</p>
        </div>
        <h2 className="text-2xl lg:text-3xl font-display font-semibold mt-2 flex items-center gap-3">
          {Icon && (
            <span className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary border border-primary/20">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <span>{title}</span>
        </h2>
        {description && <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </div>
);