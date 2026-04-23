// Tipagens e utilitários para o dataset da planilha de RH.
// Os dados são carregados de /data/dataset.json (gerado a partir do .xlsx do Drive).

export interface Funcionario {
  Funcionario: string;
  Setor: string;
  Cargo: string;
  "Tempo Empresa": number;
  "Salario Base": number;
  "Horas Extras": number;
  "Adicional Noturno": number;
  Faltas: number;
  Atrasos: number;
  Produtividade: number;
  "Projetos Entregues": number;
  "Consumo Energia kWh": number;
  "Uso Papel": number;
  "Deslocamento km": number;
  "Emissao CO2": number;
  "Custo Total": number;
  "Custo por Resultado": number;
  "Nivel Risco": string;
  "Impacto Sustentabilidade": number;
  "Sugestao IA": string;
  Score_Desperdicio: number;
  Faixa_Desperdicio: string;
  "Alerta Qualidade": string;
}

export interface KpiSetor {
  Setor: string;
  Headcount: number;
  "Custo Total (R$)": number;
  "Custo Medio (R$)": number;
  "Produtividade Media": number;
  "Projetos Entregues Medio": number;
  "Custo por Resultado (R$)": number;
  "Custo por Projeto (R$)": number;
  "CO2 Total (kg)": number;
  "CO2 Medio (kg)": number;
  "Energia Media (kWh)": number;
  "Faltas Medias": number;
  "Atrasos Medios": number;
  "Score Desperdicio": number;
}

export interface Dataset {
  base: Funcionario[];
  kpi_setor: KpiSetor[];
  score_desperdicio: any[];
  padroes_criticos: { Setor: string; "Padrao Identificado": string }[];
  diagnostico: { PERGUNTA: string; SETOR: string; "DADOS E DETALHAMENTO": string }[];
  setores: string[];
  cargos: string[];
}

export async function fetchDataset(): Promise<Dataset> {
  const res = await fetch(`/data/dataset.json?ts=${Date.now()}`);
  if (!res.ok) throw new Error("Falha ao carregar dataset");
  return res.json();
}

// ===== Helpers de cálculo =====

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const fmtNum = (n: number, d = 1) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
export const fmtPct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;

export function mean(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
export function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}
export function median(arr: number[]) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function stdev(arr: number[]) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}
export function pearson(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

export function aggregateBySetor(rows: Funcionario[]) {
  const groups = new Map<string, Funcionario[]>();
  rows.forEach((r) => {
    if (!groups.has(r.Setor)) groups.set(r.Setor, []);
    groups.get(r.Setor)!.push(r);
  });
  return Array.from(groups.entries()).map(([setor, list]) => {
    const custo = list.map((r) => r["Custo Total"]);
    const prod = list.map((r) => r.Produtividade);
    const co2 = list.map((r) => r["Emissao CO2"]);
    const sal = list.map((r) => r["Salario Base"]);
    const proj = list.map((r) => r["Projetos Entregues"]);
    const energia = list.map((r) => r["Consumo Energia kWh"]);
    const desp = list.map((r) => r.Score_Desperdicio);
    const custoTotal = sum(custo);
    const projTotal = sum(proj);
    const prodMedia = mean(prod);
    return {
      setor,
      headcount: list.length,
      custoTotal,
      custoMedio: mean(custo),
      prodMedia,
      projetosTotais: projTotal,
      projetosMedio: mean(proj),
      custoPorResultado: prodMedia > 0 ? custoTotal / list.length / prodMedia : 0,
      custoPorProjeto: projTotal > 0 ? custoTotal / projTotal : 0,
      co2Total: sum(co2),
      co2Medio: mean(co2),
      energiaMedia: mean(energia),
      salarioMedio: mean(sal),
      salarioMin: Math.min(...sal),
      salarioMax: Math.max(...sal),
      desperdicioMedio: mean(desp),
    };
  });
}

// Detecta outliers via IQR
export function outliers<T>(rows: T[], getter: (r: T) => number) {
  const vals = rows.map(getter).sort((a, b) => a - b);
  if (vals.length < 4) return [];
  const q1 = vals[Math.floor(vals.length * 0.25)];
  const q3 = vals[Math.floor(vals.length * 0.75)];
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return rows.filter((r) => getter(r) < lo || getter(r) > hi);
}

export const SETOR_COLORS: Record<string, string> = {
  Administrativo: "#22d3ee",
  Atendimento: "#a78bfa",
  Comercial: "#34d399",
  Financeiro: "#fbbf24",
  Logística: "#f472b6",
  Operações: "#fb7185",
  RH: "#60a5fa",
  TI: "#c084fc",
};
export const colorFor = (setor: string) => SETOR_COLORS[setor] ?? "#94a3b8";