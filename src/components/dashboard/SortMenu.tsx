import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SortOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: SortOption[];
  onChange: (v: string) => void;
  direction?: "asc" | "desc";
  onDirectionChange?: (d: "asc" | "desc") => void;
  className?: string;
}

export const SortMenu = ({
  value,
  options,
  onChange,
  direction,
  onDirectionChange,
  className,
}: Props) => {
  const current = options.find((o) => o.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary/70 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors " +
          (className ?? "")
        }
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span className="font-medium">Ordenar:</span>
        <span className="text-foreground">{current?.label ?? "—"}</span>
        {direction && (
          <span className="text-[10px] uppercase tracking-wider opacity-70">
            {direction === "desc" ? "↓" : "↑"}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Ordenar por
        </DropdownMenuLabel>
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onChange(o.value)}
            className={value === o.value ? "bg-secondary/60 text-foreground" : ""}
          >
            {o.label}
          </DropdownMenuItem>
        ))}
        {onDirectionChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Direção
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onDirectionChange("desc")}
              className={direction === "desc" ? "bg-secondary/60 text-foreground" : ""}
            >
              ↓ Maior → menor
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDirectionChange("asc")}
              className={direction === "asc" ? "bg-secondary/60 text-foreground" : ""}
            >
              ↑ Menor → maior
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};