import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

// Mapeia cabeçalhos da planilha (qualquer variação razoável) para a coluna do banco.
const COLUMN_MAP: Record<string, string> = {
  "Funcionario": "funcionario", "Funcionário": "funcionario",
  "Setor": "setor",
  "Cargo": "cargo",
  "Tempo Empresa": "tempo_empresa", "Tempo de Empresa": "tempo_empresa",
  "Salario Base": "salario_base", "Salário Base": "salario_base",
  "Horas Extras": "horas_extras",
  "Adicional Noturno": "adicional_noturno",
  "Faltas": "faltas",
  "Atrasos": "atrasos",
  "Produtividade": "produtividade",
  "Projetos Entregues": "projetos_entregues",
  "Consumo Energia kWh": "consumo_energia_kwh", "Consumo de Energia kWh": "consumo_energia_kwh",
  "Uso Papel": "uso_papel", "Uso de Papel": "uso_papel",
  "Deslocamento km": "deslocamento_km", "Deslocamento Km": "deslocamento_km",
  "Emissao CO2": "emissao_co2", "Emissão CO2": "emissao_co2",
  "Custo Total": "custo_total",
  "Custo por Resultado": "custo_por_resultado",
  "Nivel Risco": "nivel_risco", "Nível Risco": "nivel_risco", "Nível de Risco": "nivel_risco",
  "Impacto Sustentabilidade": "impacto_sustentabilidade",
  "Sugestao IA": "sugestao_ia", "Sugestão IA": "sugestao_ia",
  "Score_Desperdicio": "score_desperdicio", "Score Desperdicio": "score_desperdicio", "Score Desperdício": "score_desperdicio",
  "Faixa_Desperdicio": "faixa_desperdicio", "Faixa Desperdicio": "faixa_desperdicio", "Faixa Desperdício": "faixa_desperdicio",
  "Alerta Qualidade": "alerta_qualidade", "Alerta de Qualidade": "alerta_qualidade",
};

const NUMERIC_COLS = new Set([
  "tempo_empresa","salario_base","horas_extras","adicional_noturno","faltas","atrasos",
  "produtividade","projetos_entregues","consumo_energia_kwh","uso_papel","deslocamento_km",
  "emissao_co2","custo_total","custo_por_resultado","impacto_sustentabilidade","score_desperdicio",
]);

function parseNum(v: string): number | null {
  if (v === undefined || v === null || v === "") return null;
  const cleaned = String(v).replace(/\./g, "").replace(",", ".").replace(/[^\d.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function extractSpreadsheetId(input: string): string {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : input;
}

async function fetchSheetValues(spreadsheetId: string, range: string) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const sheetsKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");
  if (!sheetsKey) throw new Error("GOOGLE_SHEETS_API_KEY not configured (Google Sheets connector)");
  const url = `${GATEWAY}/spreadsheets/${spreadsheetId}/values/${range}`;
  const r = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": sheetsKey,
    },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Sheets API failed [${r.status}]: ${JSON.stringify(data)}`);
  return (data.values ?? []) as string[][];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    let { spreadsheet_id, sheet_name } = body as { spreadsheet_id?: string; sheet_name?: string };

    // Se não vier no payload, lê do dataset_meta
    if (!spreadsheet_id || !sheet_name) {
      const { data: meta } = await supabase.from("dataset_meta").select("*").eq("id", 1).maybeSingle();
      spreadsheet_id = spreadsheet_id ?? meta?.spreadsheet_id ?? undefined;
      sheet_name = sheet_name ?? meta?.sheet_name ?? "base";
    }
    if (!spreadsheet_id) {
      return new Response(JSON.stringify({ error: "spreadsheet_id é obrigatório (ou configure em dataset_meta)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    spreadsheet_id = extractSpreadsheetId(spreadsheet_id);
    const range = `${sheet_name}!A1:Z10000`;

    const values = await fetchSheetValues(spreadsheet_id, range);
    if (values.length < 2) throw new Error(`Aba '${sheet_name}' vazia ou só com cabeçalhos.`);

    const headers = values[0];
    const rows = values.slice(1);

    const records = rows
      .map((row) => {
        const rec: Record<string, any> = {};
        headers.forEach((h, i) => {
          const col = COLUMN_MAP[h.trim()];
          if (!col) return;
          const raw = row[i] ?? "";
          rec[col] = NUMERIC_COLS.has(col) ? parseNum(raw) : (raw === "" ? null : raw);
        });
        return rec;
      })
      .filter((r) => r.funcionario && r.setor && r.cargo);

    if (!records.length) throw new Error("Nenhuma linha válida encontrada (verifique cabeçalhos: precisa ter Funcionario, Setor, Cargo).");

    // Limpa e insere
    await supabase.from("funcionarios").delete().neq("id", -1);
    const chunkSize = 500;
    for (let i = 0; i < records.length; i += chunkSize) {
      const { error } = await supabase.from("funcionarios").insert(records.slice(i, i + chunkSize));
      if (error) throw new Error(`Insert falhou no chunk ${i}: ${error.message}`);
    }

    await supabase.from("dataset_meta").upsert({
      id: 1, spreadsheet_id, sheet_name,
      last_sync_at: new Date().toISOString(),
      total_rows: records.length,
      source: `Google Sheets • ${sheet_name}`,
    });

    return new Response(JSON.stringify({
      ok: true, total: records.length, spreadsheet_id, sheet_name,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("sync-sheet error:", e);
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});