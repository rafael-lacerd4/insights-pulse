import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BarChart3,
  Users,
  Sparkles,
  Leaf,
} from "lucide-react";

export const SECTIONS = [
  { id: "diagnostico", label: "Diagnóstico", icon: LayoutDashboard },
  { id: "kpis", label: "KPIs por Setor", icon: Activity },
  { id: "padroes", label: "Padrões Críticos", icon: AlertTriangle },
  { id: "graficos", label: "Gráficos", icon: BarChart3 },
  { id: "pessoas", label: "Pessoas", icon: Users },
  { id: "sustentabilidade", label: "Sustentabilidade", icon: Leaf },
  { id: "executiva", label: "Análise Executiva", icon: Sparkles },
] as const;

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

const GROUPS: { label: string; ids: string[] }[] = [
  { label: "Visão geral", ids: ["diagnostico", "kpis"] },
  { label: "Análises", ids: ["padroes", "graficos", "pessoas"] },
  { label: "Estratégia", ids: ["sustentabilidade", "executiva"] },
];

export const Sidebar = ({ active, onSelect }: Props) => {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl sticky top-0 h-screen">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center font-display font-bold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/.6)]">
            HR
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[hsl(var(--success))] ring-2 ring-sidebar animate-pulse-glow" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold leading-tight">HR Executive BI</p>
            <p className="text-[11px] text-muted-foreground">Diagnóstico Gerencial</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold">
              {g.label}
            </p>
            <div className="space-y-0.5">
              {SECTIONS.filter((s) => g.ids.includes(s.id)).map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={cn(
                      "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-gradient-to-r from-primary/15 to-accent/10 text-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-primary to-accent" />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 m-3 rounded-xl glass-card text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
          <span className="font-medium text-foreground/80">Dataset sincronizado</span>
        </div>
        Fonte: planilha gerencial • dados em tempo real
      </div>
    </aside>
  );
};