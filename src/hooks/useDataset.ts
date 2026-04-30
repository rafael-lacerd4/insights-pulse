import { useEffect, useState, useCallback } from "react";
import { fetchDataset, type Dataset, type Funcionario } from "@/lib/dataset";
import { supabase } from "@/integrations/supabase/client";

// Mapeia uma linha do banco (snake_case) para o formato Funcionario usado pelo dashboard.
function rowToFuncionario(r: any): Funcionario {
  return {
    Funcionario: r.funcionario,
    Setor: r.setor,
    Cargo: r.cargo,
    "Tempo Empresa": Number(r.tempo_empresa ?? 0),
    "Salario Base": Number(r.salario_base ?? 0),
    "Horas Extras": Number(r.horas_extras ?? 0),
    "Adicional Noturno": Number(r.adicional_noturno ?? 0),
    Faltas: Number(r.faltas ?? 0),
    Atrasos: Number(r.atrasos ?? 0),
    Produtividade: Number(r.produtividade ?? 0),
    "Projetos Entregues": Number(r.projetos_entregues ?? 0),
    "Consumo Energia kWh": Number(r.consumo_energia_kwh ?? 0),
    "Uso Papel": Number(r.uso_papel ?? 0),
    "Deslocamento km": Number(r.deslocamento_km ?? 0),
    "Emissao CO2": Number(r.emissao_co2 ?? 0),
    "Custo Total": Number(r.custo_total ?? 0),
    "Custo por Resultado": Number(r.custo_por_resultado ?? 0),
    "Nivel Risco": r.nivel_risco ?? "Baixo",
    "Impacto Sustentabilidade": Number(r.impacto_sustentabilidade ?? 0),
    "Sugestao IA": r.sugestao_ia ?? "Manter",
    Score_Desperdicio: Number(r.score_desperdicio ?? 0),
    Faixa_Desperdicio: r.faixa_desperdicio ?? "Moderado",
    "Alerta Qualidade": r.alerta_qualidade ?? "OK",
  };
}

function buildDataset(base: Funcionario[], meta: any): Dataset {
  const setores = Array.from(new Set(base.map((r) => r.Setor))).sort();
  const cargos = Array.from(new Set(base.map((r) => r.Cargo))).sort();
  return {
    base,
    kpi_setor: [], score_desperdicio: [], padroes_criticos: [], diagnostico: [],
    setores, cargos,
    meta: {
      total_funcionarios: base.length,
      fonte: meta?.source ?? "Lovable Cloud",
      gerado_em: meta?.last_sync_at ?? new Date().toISOString(),
    },
  };
}

export function useDataset() {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) tenta carregar do banco
      const [funcRes, metaRes] = await Promise.all([
        supabase.from("funcionarios").select("*").limit(5000),
        supabase.from("dataset_meta").select("*").eq("id", 1).maybeSingle(),
      ]);
      if (funcRes.error) throw funcRes.error;
      const rows = funcRes.data ?? [];

      if (rows.length > 0) {
        setData(buildDataset(rows.map(rowToFuncionario), metaRes.data));
        setUpdatedAt(metaRes.data?.last_sync_at ? new Date(metaRes.data.last_sync_at) : new Date());
      } else {
        // Fallback: JSON estático (caso ainda não tenha sincronizado a planilha)
        const d = await fetchDataset();
        setData(d);
        setUpdatedAt(new Date());
      }
    } catch (e: any) {
      // Fallback final ao JSON estático em caso de erro
      try {
        const d = await fetchDataset();
        setData(d);
        setUpdatedAt(new Date());
      } catch (e2: any) {
        setError(e2?.message ?? e?.message ?? "Erro");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    // Realtime: recarrega quando funcionarios ou meta mudarem
    const channel = supabase
      .channel("dataset-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "funcionarios" }, () => reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "dataset_meta" }, () => reload())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [reload]);

  return { data, loading, error, reload, updatedAt };
}