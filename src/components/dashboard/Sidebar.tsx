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

export const Sidebar = ({ active, onSelect }: Props) => {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl sticky top-0 h-screen">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center font-display font-bold text-primary-foreground">
            HR
          </div>
          <div>
            <p className="text-sm font-display font-semibold leading-tight">HR Executive BI</p>
            <p className="text-xs text-muted-foreground">Diagnóstico Gerencial</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_hsl(var(--primary))]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span className="font-medium">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 m-3 rounded-xl glass-card text-xs text-muted-foreground">
        Fonte: planilha gerencial • 1.200 colaboradores • 8 setores
      </div>
    </aside>
  );
};