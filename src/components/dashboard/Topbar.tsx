import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  setores: string[];
  cargos: string[];
  setorFiltro: string;
  cargoFiltro: string;
  onSetorChange: (v: string) => void;
  onCargoChange: (v: string) => void;
  onReload: () => void;
  loading: boolean;
  updatedAt: Date | null;
}

export const Topbar = ({
  setores, cargos, setorFiltro, cargoFiltro, onSetorChange, onCargoChange, onReload, loading, updatedAt,
}: Props) => {
  const filtersActive =
    Number(setorFiltro !== "__all__") + Number(cargoFiltro !== "__all__");

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3 px-4 lg:px-8 py-3">
        <div className="flex flex-col">
          <h1 className="text-lg lg:text-xl font-display font-semibold gradient-text">
            Diagnóstico Gerencial — RH
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1.5 chip border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {updatedAt ? `Sincronizado ${updatedAt.toLocaleTimeString("pt-BR")}` : "Carregando dados…"}
            </span>
            {filtersActive > 0 && (
              <span className="chip border-primary/30 bg-primary/10 text-primary">
                <Filter className="h-3 w-3" />
                {filtersActive} filtro{filtersActive > 1 ? "s" : ""} ativo{filtersActive > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Select value={setorFiltro} onValueChange={onSetorChange}>
            <SelectTrigger className="w-[160px] h-9 bg-card/60 border-border hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="__all__">Todos os setores</SelectItem>
              {setores.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cargoFiltro} onValueChange={onCargoChange}>
            <SelectTrigger className="w-[180px] h-9 bg-card/60 border-border hover:border-primary/40 transition-colors">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="__all__">Todos os cargos</SelectItem>
              {cargos.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filtersActive > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onSetorChange("__all__"); onCargoChange("__all__"); }}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onReload} disabled={loading} className="gap-2 hover:border-primary/50 hover:text-primary transition-colors">
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Atualizar
          </Button>

          <a
            href="https://docs.google.com/spreadsheets/d/10B4GU7s-Q7DnsBOM24VbVkKP7-sSsRgO/edit"
            target="_blank" rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Planilha
          </a>
        </div>
      </div>
    </header>
  );
};