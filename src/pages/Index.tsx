import { useMemo, useState } from "react";
import { Bar, Doughnut, Scatter, Line } from "react-chartjs-2";
import {
  DollarSign, Activity, Leaf, Award, AlertTriangle, Users, Sparkles,
  TrendingDown, TrendingUp, Briefcase, GraduationCap, Clock, Zap, UserMinus, ShieldAlert,
} from "lucide-react";
import { useDataset } from "@/hooks/useDataset";
import {
  aggregateBySetor, fmtBRL, fmtNum, mean, sum, median, pearson, outliers,
  colorFor, type Funcionario,
} from "@/lib/dataset";
import { Sidebar, SECTIONS } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import "@/components/dashboard/charts";
import { baseOptions } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { data, loading, error, reload, updatedAt } = useDataset();
  const [active, setActive] = useState<string>("diagnostico");
  const [setorFiltro, setSetorFiltro] = useState("__all__");
  const [cargoFiltro, setCargoFiltro] = useState("__all__");

  const filtered = useMemo(() => {
    if (!data) return [] as Funcionario[];
    return data.base.filter(
      (r) =>
        (setorFiltro === "__all__" || r.Setor === setorFiltro) &&
        (cargoFiltro === "__all__" || r.Cargo === cargoFiltro)
    );
  }, [data, setorFiltro, cargoFiltro]);

  const agg = useMemo(() => aggregateBySetor(filtered), [filtered]);
  const aggAll = useMemo(() => (data ? aggregateBySetor(data.base) : []), [data]);

  const totalCusto = useMemo(() => sum(filtered.map((r) => r["Custo Total"])), [filtered]);
  const totalCO2 = useMemo(() => sum(filtered.map((r) => r["Emissao CO2"])), [filtered]);
  const prodMedia = useMemo(() => mean(filtered.map((r) => r.Produtividade)), [filtered]);
  const headcount = filtered.length;

  // Diagnósticos derivados
  const setorMaisCaro = [...agg].sort((a, b) => b.custoTotal - a.custoTotal)[0];
  const setorMenosProd = [...agg].sort((a, b) => a.prodMedia - b.prodMedia)[0];
  const setorMaiorCO2 = [...agg].sort((a, b) => b.co2Total - a.co2Total)[0];
  const setorMelhorCB = [...agg]
    .filter((s) => s.prodMedia > 0)
    .sort((a, b) => a.custoPorResultado - b.custoPorResultado)[0];

  // Estagiários e veteranos
  const LIMITE_ESTAGIO = 1500; // referência salarial para estagiário
  const estagiarios = useMemo(
    () => filtered.filter((r) => /estagi/i.test(r.Cargo)),
    [filtered]
  );
  const estagiariosAcimaLimite = useMemo(
    () => [...estagiarios]
      .filter((r) => r["Salario Base"] > LIMITE_ESTAGIO)
      .sort((a, b) => b["Salario Base"] - a["Salario Base"]),
    [estagiarios]
  );
  const desperdicioEstagiarios = useMemo(
    () => sum(estagiariosAcimaLimite.map((r) => (r["Salario Base"] - LIMITE_ESTAGIO) * 12)),
    [estagiariosAcimaLimite]
  );

  // Mediana salarial por cargo (referência da própria planilha)
  const medianaPorCargo = useMemo(() => {
    if (!data) return new Map<string, number>();
    const groups = new Map<string, number[]>();
    data.base.forEach((r) => {
      if (!groups.has(r.Cargo)) groups.set(r.Cargo, []);
      groups.get(r.Cargo)!.push(r["Salario Base"]);
    });
    const m = new Map<string, number>();
    groups.forEach((v, k) => m.set(k, median(v)));
    return m;
  }, [data]);

  // Veteranos (>= 5 anos) recebendo abaixo da mediana do próprio cargo
  const veteranos = useMemo(
    () => filtered.filter((r) => r["Tempo Empresa"] >= 5),
    [filtered]
  );
  const veteranosSubpagos = useMemo(() => {
    return veteranos
      .map((r) => {
        const med = medianaPorCargo.get(r.Cargo) ?? 0;
        return { ...r, mediana: med, gap: med - r["Salario Base"] };
      })
      .filter((r) => r.gap > 0)
      .sort((a, b) => b.gap - a.gap);
  }, [veteranos, medianaPorCargo]);
  const gapMensalTotal = useMemo(
    () => sum(veteranosSubpagos.map((r) => r.gap)),
    [veteranosSubpagos]
  );

  // Risco de demissão: muito tempo de casa + alto custo + baixa produtividade
  const riscoDemissao = useMemo(() => {
    if (!filtered.length) return [];
    const prodMed = mean(filtered.map((r) => r.Produtividade));
    const custoMed = mean(filtered.map((r) => r["Custo Total"]));
    return filtered
      .filter((r) => r["Tempo Empresa"] >= 8 && r["Custo Total"] > custoMed && r.Produtividade < prodMed)
      .map((r) => ({
        ...r,
        scoreRisco:
          (r["Tempo Empresa"] / 30) * 0.3 +
          (r["Custo Total"] / custoMed - 1) * 0.4 +
          (1 - r.Produtividade / Math.max(prodMed, 1)) * 0.3,
      }))
      .sort((a, b) => b.scoreRisco - a.scoreRisco);
  }, [filtered]);

  const outliersCusto = useMemo(() => outliers(filtered, (r) => r["Custo Total"]).slice(0, 8), [filtered]);

  const corrTempoProd = useMemo(
    () => pearson(filtered.map((r) => r["Tempo Empresa"]), filtered.map((r) => r.Produtividade)),
    [filtered]
  );
  const corrCustoProd = useMemo(
    () => pearson(filtered.map((r) => r["Custo Total"]), filtered.map((r) => r.Produtividade)),
    [filtered]
  );

  // ============= Loading / Error =============
  if (loading && !data) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando dataset…</p>
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen grid place-items-center p-8 text-center">
        <div className="glass-card rounded-xl p-8 max-w-md">
          <AlertTriangle className="h-10 w-10 text-danger mx-auto" />
          <h2 className="mt-4 font-display text-xl">Erro ao carregar dados</h2>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // ============= Charts =============
  const orderByCusto = [...agg].sort((a, b) => b.custoTotal - a.custoTotal);

  const custoData = {
    labels: orderByCusto.map((s) => s.setor),
    datasets: [{
      label: "Custo Total (R$)",
      data: orderByCusto.map((s) => s.custoTotal),
      backgroundColor: orderByCusto.map((s) => colorFor(s.setor)),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const orderByProd = [...agg].sort((a, b) => b.prodMedia - a.prodMedia);
  const prodData = {
    labels: orderByProd.map((s) => s.setor),
    datasets: [{
      label: "Produtividade Média",
      data: orderByProd.map((s) => s.prodMedia),
      backgroundColor: orderByProd.map((s) => colorFor(s.setor)),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const headcountData = {
    labels: agg.map((s) => s.setor),
    datasets: [{
      data: agg.map((s) => s.headcount),
      backgroundColor: agg.map((s) => colorFor(s.setor)),
      borderColor: "hsl(222 24% 10%)",
      borderWidth: 3,
    }],
  };

  const scatterData = {
    datasets: agg.map((s) => ({
      label: s.setor,
      data: filtered
        .filter((r) => r.Setor === s.setor)
        .map((r) => ({ x: r["Custo Total"], y: r.Produtividade })),
      backgroundColor: colorFor(s.setor) + "cc",
      pointRadius: 3,
      pointHoverRadius: 6,
    })),
  };

  const co2Data = {
    labels: [...agg].sort((a, b) => b.co2Total - a.co2Total).map((s) => s.setor),
    datasets: [{
      label: "CO₂ Total (kg)",
      data: [...agg].sort((a, b) => b.co2Total - a.co2Total).map((s) => s.co2Total),
      backgroundColor: "rgba(52, 211, 153, 0.6)",
      borderColor: "rgba(52, 211, 153, 1)",
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  // Distribuição salarial: min/median/max por setor (simulação de boxplot)
  const salDist = {
    labels: agg.map((s) => s.setor),
    datasets: [
      {
        label: "Mín",
        data: agg.map((s) => s.salarioMin),
        backgroundColor: "rgba(96, 165, 250, 0.5)",
        borderRadius: 6,
      },
      {
        label: "Médio",
        data: agg.map((s) => s.salarioMedio),
        backgroundColor: "rgba(34, 211, 238, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Máx",
        data: agg.map((s) => s.salarioMax),
        backgroundColor: "rgba(192, 132, 252, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  // Insights executivos automatizados
  const insights = buildInsights({
    setorMaisCaro, setorMenosProd, setorMaiorCO2, setorMelhorCB,
    corrTempoProd, corrCustoProd,
    estagiariosCount: estagiarios.length,
    veteranosSubpagosCount: veteranosSubpagos.length,
    outliersCount: outliersCusto.length,
    totalCusto, totalCO2, prodMedia, headcount,
    aggAll,
  });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar active={active} onSelect={(id) => {
        setActive(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }} />

      <div className="flex-1 min-w-0">
        <Topbar
          setores={data.setores}
          cargos={data.cargos}
          setorFiltro={setorFiltro}
          cargoFiltro={cargoFiltro}
          onSetorChange={setSetorFiltro}
          onCargoChange={setCargoFiltro}
          onReload={reload}
          loading={loading}
          updatedAt={updatedAt}
        />

        {/* Mobile section nav */}
        <div className="lg:hidden px-4 py-3 border-b border-border overflow-x-auto">
          <Tabs value={active} onValueChange={(v) => {
            setActive(v);
            document.getElementById(v)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>
            <TabsList className="bg-card">
              {SECTIONS.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="text-xs">{s.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <main className="px-4 lg:px-8 py-6 lg:py-8 space-y-12 max-w-[1600px] mx-auto">
          {/* ===================== DIAGNÓSTICO ===================== */}
          <section id="diagnostico" className="scroll-mt-24">
            <SectionHeader
              eyebrow="Visão Macro"
              title="Diagnóstico da empresa"
              description={`Snapshot dos ${headcount.toLocaleString("pt-BR")} colaboradores filtrados, distribuídos em ${agg.length} setor(es).`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                label="Custo Total"
                value={fmtBRL(totalCusto)}
                hint={`Custo médio por func: ${fmtBRL(totalCusto / Math.max(headcount, 1))}`}
                icon={DollarSign} tone="primary" delay={0}
              />
              <KpiCard
                label="Produtividade média"
                value={`${fmtNum(prodMedia, 1)} pts`}
                hint={`Empresa: ${fmtNum(mean(data.base.map((r) => r.Produtividade)), 1)} pts`}
                icon={Activity} tone="success" delay={50}
              />
              <KpiCard
                label="CO₂ Total"
                value={`${fmtNum(totalCO2, 0)} kg`}
                hint={`Médio por func: ${fmtNum(totalCO2 / Math.max(headcount, 1), 1)} kg`}
                icon={Leaf} tone="warning" delay={100}
              />
              <KpiCard
                label="Headcount"
                value={headcount.toLocaleString("pt-BR")}
                hint={`${estagiarios.length} estagiários • ${veteranosSubpagos.length} veteranos subpagos`}
                icon={Users} tone="default" delay={150}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <DiagnosticoCard icon={DollarSign} tone="danger" label="Setor mais caro"
                setor={setorMaisCaro?.setor}
                detail={setorMaisCaro && `${fmtBRL(setorMaisCaro.custoTotal)} • ${setorMaisCaro.headcount} func • médio ${fmtBRL(setorMaisCaro.custoMedio)}`}
              />
              <DiagnosticoCard icon={TrendingDown} tone="warning" label="Setor menos produtivo"
                setor={setorMenosProd?.setor}
                detail={setorMenosProd && `${fmtNum(setorMenosProd.prodMedia, 1)} pts • ${fmtNum(setorMenosProd.projetosMedio, 1)} proj/func`}
              />
              <DiagnosticoCard icon={Leaf} tone="warning" label="Maior CO₂"
                setor={setorMaiorCO2?.setor}
                detail={setorMaiorCO2 && `${fmtNum(setorMaiorCO2.co2Total, 0)} kg • ${fmtNum(setorMaiorCO2.co2Medio, 1)} kg/func`}
              />
              <DiagnosticoCard icon={Award} tone="success" label="Melhor custo-benefício"
                setor={setorMelhorCB?.setor}
                detail={setorMelhorCB && `Custo/Resultado ${fmtBRL(setorMelhorCB.custoPorResultado)} • ${fmtNum(setorMelhorCB.prodMedia, 1)} pts`}
              />
            </div>
          </section>

          {/* ===================== KPIs ===================== */}
          <section id="kpis" className="scroll-mt-24">
            <SectionHeader eyebrow="Indicadores" title="KPIs por setor"
              description="Tabela detalhada com custo, produtividade, CO₂ e desperdício para cada setor filtrado." />
            <div className="glass-card rounded-xl overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-secondary/50">
                    <tr>
                      {["Setor","Headcount","Custo Total","Custo Médio","Produtividade","Custo/Resultado","CO₂ Total","CO₂ Médio","Desperdício"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...agg].sort((a, b) => b.custoTotal - a.custoTotal).map((s) => (
                      <tr key={s.setor} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorFor(s.setor) }} />
                            {s.setor}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.headcount}</td>
                        <td className="px-4 py-3 font-mono">{fmtBRL(s.custoTotal)}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{fmtBRL(s.custoMedio)}</td>
                        <td className="px-4 py-3">
                          <ProdBar value={s.prodMedia} />
                        </td>
                        <td className="px-4 py-3 font-mono">{fmtBRL(s.custoPorResultado)}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{fmtNum(s.co2Total, 0)} kg</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{fmtNum(s.co2Medio, 1)} kg</td>
                        <td className="px-4 py-3">
                          <DespBadge value={s.desperdicioMedio} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ===================== PADRÕES CRÍTICOS ===================== */}
          <section id="padroes" className="scroll-mt-24">
            <SectionHeader eyebrow="Alertas" title="Padrões críticos automáticos"
              description="Combinações de alto custo, baixa produtividade, concentração de CO₂ e distorções salariais." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.padroes_criticos.map((p, i) => (
                <PatternCard key={i} setor={p.Setor} text={p["Padrao Identificado"]} />
              ))}
            </div>
          </section>

          {/* ===================== GRÁFICOS ===================== */}
          <section id="graficos" className="scroll-mt-24">
            <SectionHeader eyebrow="Visualizações" title="Gráficos interativos"
              description="Hover nos pontos e barras para detalhes. Filtros no topo afetam todos os gráficos." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCard title="Custo total por setor" subtitle="Ordenado do maior para o menor">
                <Bar data={custoData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } }} />
              </ChartCard>
              <ChartCard title="Produtividade média por setor" subtitle="Pontuação 0–100">
                <Bar data={prodData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } }} />
              </ChartCard>
              <ChartCard title="Headcount por setor" subtitle="Distribuição de colaboradores">
                <Doughnut data={headcountData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: "right", labels: { color: "rgba(226,232,240,0.85)", font: { size: 11 } } } },
                  cutout: "62%",
                }} />
              </ChartCard>
              <ChartCard title="Custo vs Produtividade" subtitle="Cada ponto = um colaborador. Clusters revelam ineficiência.">
                <Scatter data={scatterData} options={{
                  ...baseOptions,
                  scales: {
                    x: { ...baseOptions.scales.x, title: { display: true, text: "Custo Total (R$)", color: "rgba(148,163,184,0.7)" } },
                    y: { ...baseOptions.scales.y, title: { display: true, text: "Produtividade", color: "rgba(148,163,184,0.7)" } },
                  },
                }} />
              </ChartCard>
              <ChartCard title="CO₂ total por setor" subtitle="Impacto ambiental acumulado">
                <Bar data={co2Data} options={{ ...baseOptions, indexAxis: "y" as const, plugins: { ...baseOptions.plugins, legend: { display: false } } }} />
              </ChartCard>
              <ChartCard title="Distribuição salarial" subtitle="Mínimo, médio e máximo por setor">
                <Bar data={salDist} options={baseOptions} />
              </ChartCard>
            </div>
          </section>

          {/* ===================== PESSOAS ===================== */}
          <section id="pessoas" className="scroll-mt-24">
            <SectionHeader eyebrow="Capital humano" title="Estagiários, veteranos e outliers"
              description="Análise de quem está nos extremos: novos talentos em desenvolvimento e profissionais com longa casa potencialmente subpagos." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="glass-card rounded-xl p-5 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/15 text-primary"><GraduationCap className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-display font-semibold">Estagiários ({estagiarios.length})</h3>
                    <p className="text-xs text-muted-foreground">Salário médio: {fmtBRL(mean(estagiarios.map((e) => e["Salario Base"])) || 0)}</p>
                  </div>
                </div>
                <PersonList rows={estagiarios.slice(0, 6)} metric={(r) => `${fmtNum(r.Produtividade, 0)} pts`} />
              </div>

              <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-warning/15 text-warning"><Clock className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-display font-semibold">Veteranos subpagos ({veteranosSubpagos.length})</h3>
                    <p className="text-xs text-muted-foreground">7+ anos de casa, salário &lt; 85% da média</p>
                  </div>
                </div>
                <PersonList
                  rows={veteranosSubpagos.slice(0, 6)}
                  metric={(r) => `${fmtNum(r["Tempo Empresa"], 1)}a • ${fmtBRL(r["Salario Base"])}`}
                />
              </div>

              <div className="glass-card rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-danger/15 text-danger"><AlertTriangle className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-display font-semibold">Outliers de custo ({outliersCusto.length})</h3>
                    <p className="text-xs text-muted-foreground">Detectado por IQR (1.5×)</p>
                  </div>
                </div>
                <PersonList rows={outliersCusto} metric={(r) => fmtBRL(r["Custo Total"])} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCard title="Tempo de empresa vs Produtividade" subtitle={`Correlação Pearson: ${corrTempoProd.toFixed(2)}`}>
                <Scatter
                  data={{
                    datasets: agg.map((s) => ({
                      label: s.setor,
                      data: filtered.filter((r) => r.Setor === s.setor)
                        .map((r) => ({ x: r["Tempo Empresa"], y: r.Produtividade })),
                      backgroundColor: colorFor(s.setor) + "cc",
                      pointRadius: 3,
                    })),
                  }}
                  options={{
                    ...baseOptions,
                    scales: {
                      x: { ...baseOptions.scales.x, title: { display: true, text: "Tempo de empresa (anos)", color: "rgba(148,163,184,0.7)" } },
                      y: { ...baseOptions.scales.y, title: { display: true, text: "Produtividade", color: "rgba(148,163,184,0.7)" } },
                    },
                  }}
                />
              </ChartCard>
              <ChartCard title="Ranking de eficiência" subtitle="Melhor custo por resultado = mais eficiente">
                <Bar
                  data={{
                    labels: [...agg].sort((a, b) => a.custoPorResultado - b.custoPorResultado).map((s) => s.setor),
                    datasets: [{
                      label: "Custo / Resultado (R$)",
                      data: [...agg].sort((a, b) => a.custoPorResultado - b.custoPorResultado).map((s) => s.custoPorResultado),
                      backgroundColor: [...agg].sort((a, b) => a.custoPorResultado - b.custoPorResultado).map((s) => colorFor(s.setor)),
                      borderRadius: 8,
                    }],
                  }}
                  options={{ ...baseOptions, indexAxis: "y" as const, plugins: { ...baseOptions.plugins, legend: { display: false } } }}
                />
              </ChartCard>
            </div>
          </section>

          {/* ===================== SUSTENTABILIDADE ===================== */}
          <section id="sustentabilidade" className="scroll-mt-24">
            <SectionHeader eyebrow="ESG" title="Sustentabilidade & desperdício"
              description="Energia, papel, deslocamento e CO₂ por setor — combinados no score composto de desperdício." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <KpiCard label="Energia média" value={`${fmtNum(mean(filtered.map((r) => r["Consumo Energia kWh"])), 0)} kWh`} icon={Zap} tone="warning" />
              <KpiCard label="CO₂ médio por func" value={`${fmtNum(totalCO2 / Math.max(headcount, 1), 1)} kg`} icon={Leaf} tone="success" />
              <KpiCard label="Score desperdício médio" value={fmtNum(mean(filtered.map((r) => r.Score_Desperdicio)), 3)} icon={TrendingUp} tone="danger" />
            </div>
          </section>

          {/* ===================== ANÁLISE EXECUTIVA ===================== */}
          <section id="executiva" className="scroll-mt-24">
            <SectionHeader eyebrow="Insights automáticos" title="Análise executiva"
              description="Texto e prioridades gerados automaticamente a partir dos dados filtrados." />

            <div className="glass-card rounded-xl p-6 lg:p-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">Sumário gerencial</h3>
              </div>
              <p className="text-base leading-relaxed text-foreground/90">{insights.summary}</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.cards.map((c, i) => (
                  <div key={i} className="rounded-xl p-4 border border-border bg-secondary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-wider border-${c.tone === "danger" ? "danger" : c.tone === "warning" ? "warning" : "primary"}/40`}>
                        {c.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{c.setor}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="text-center text-xs text-muted-foreground py-8">
            HR Executive BI • dados sincronizados com a planilha gerencial • {data.base.length.toLocaleString("pt-BR")} colaboradores
          </footer>
        </main>
      </div>
    </div>
  );
};

/* ============= sub-components ============= */

const DiagnosticoCard = ({ icon: Icon, tone, label, setor, detail }: any) => (
  <div className="glass-card rounded-xl p-4 animate-fade-in-up">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className={`p-2 rounded-lg ${
        tone === "danger" ? "bg-danger/15 text-danger"
        : tone === "warning" ? "bg-warning/15 text-warning"
        : tone === "success" ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
        : "bg-primary/15 text-primary"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
    </div>
    <p className="font-display text-xl font-semibold">{setor ?? "—"}</p>
    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{detail}</p>
  </div>
);

const ProdBar = ({ value }: { value: number }) => {
  const pct = Math.min(100, Math.max(0, value));
  const color = value >= 60 ? "hsl(var(--success))" : value >= 45 ? "hsl(var(--warning))" : "hsl(var(--danger))";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-xs text-muted-foreground">{fmtNum(value, 1)}</span>
    </div>
  );
};

const DespBadge = ({ value }: { value: number }) => {
  const tone = value >= 0.55 ? "danger" : value >= 0.45 ? "warning" : "success";
  const text = value >= 0.55 ? "Alto" : value >= 0.45 ? "Moderado" : "Baixo";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
      tone === "danger" ? "bg-danger/15 text-danger"
      : tone === "warning" ? "bg-warning/15 text-warning"
      : "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
    }`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text} • {value.toFixed(3)}
    </span>
  );
};

const PatternCard = ({ setor, text }: { setor: string; text: string }) => {
  const isCritical = /CUSTO|INEFIC|DESPERD|AMBIENTAL/i.test(text);
  const isOk = /sem padrao/i.test(text);
  return (
    <div className={`glass-card rounded-xl p-5 animate-fade-in-up border-l-4 ${
      isOk ? "border-l-[hsl(var(--success))]"
      : /AMBIENTAL/i.test(text) ? "border-l-primary"
      : /INEFIC/i.test(text) ? "border-l-danger"
      : "border-l-warning"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorFor(setor) }} />
        <span className="font-display font-semibold">{setor}</span>
        {isCritical && <Briefcase className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
      </div>
      <p className={`text-sm ${isOk ? "text-muted-foreground" : "text-foreground"}`}>{text}</p>
    </div>
  );
};

const PersonList = ({ rows, metric }: { rows: Funcionario[]; metric: (r: Funcionario) => string }) => {
  if (!rows.length) return <p className="text-sm text-muted-foreground">Nenhum registro encontrado com o filtro atual.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r, i) => (
        <li key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-secondary/40 transition-colors">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{r.Funcionario}</p>
            <p className="text-xs text-muted-foreground truncate">{r.Cargo} • {r.Setor}</p>
          </div>
          <span className="font-mono text-xs text-foreground/80 shrink-0">{metric(r)}</span>
        </li>
      ))}
    </ul>
  );
};

/* ============= insights builder ============= */

function buildInsights(p: any) {
  const partes: string[] = [];
  if (p.setorMaisCaro)
    partes.push(`O setor ${p.setorMaisCaro.setor} concentra o maior custo total (${fmtBRL(p.setorMaisCaro.custoTotal)}, ${fmtNum((p.setorMaisCaro.custoTotal / p.totalCusto) * 100, 1)}% da empresa)`);
  if (p.setorMenosProd)
    partes.push(`enquanto ${p.setorMenosProd.setor} apresenta a menor produtividade média (${fmtNum(p.setorMenosProd.prodMedia, 1)} pts vs média geral de ${fmtNum(p.prodMedia, 1)})`);
  if (p.setorMaiorCO2)
    partes.push(`. ${p.setorMaiorCO2.setor} responde por ${fmtNum((p.setorMaiorCO2.co2Total / p.totalCO2) * 100, 1)}% do CO₂ emitido`);
  if (p.setorMelhorCB)
    partes.push(`, e ${p.setorMelhorCB.setor} entrega o melhor custo/resultado (${fmtBRL(p.setorMelhorCB.custoPorResultado)} por ponto de produtividade).`);

  const summary =
    partes.join(" ") +
    ` A correlação tempo de empresa × produtividade é de ${p.corrTempoProd.toFixed(2)} — ` +
    (Math.abs(p.corrTempoProd) < 0.15
      ? "praticamente nula, indicando que veteranos não estão necessariamente entregando mais do que iniciantes."
      : p.corrTempoProd > 0
      ? "positiva: experiência se traduz em entrega."
      : "negativa: pessoas com mais tempo de casa estão menos produtivas, sinal de retenção sem renovação.") +
    ` Custo × produtividade tem correlação ${p.corrCustoProd.toFixed(2)}, ` +
    (p.corrCustoProd > 0.3
      ? "ou seja, pagar mais tem retorno em entrega."
      : "indicando que custos altos não estão pareados a entregas — há ineficiência alocativa.");

  const cards: { tag: string; setor: string; text: string; tone: "danger" | "warning" | "primary" }[] = [];

  if (p.setorMaisCaro && p.setorMenosProd && p.setorMaisCaro.setor === p.setorMenosProd.setor) {
    cards.push({
      tag: "Crítico", setor: p.setorMaisCaro.setor, tone: "danger",
      text: `Setor combina o maior custo da empresa com a menor produtividade — prioridade #1 de revisão de processos e headcount.`,
    });
  }

  if (p.veteranosSubpagosCount > 0) {
    cards.push({
      tag: "Retenção", setor: "Transversal", tone: "warning",
      text: `${p.veteranosSubpagosCount} colaboradores com 7+ anos de casa estão recebendo abaixo de 85% da média da empresa. Risco de turnover de conhecimento crítico.`,
    });
  }

  if (p.estagiariosCount > 0) {
    cards.push({
      tag: "Pipeline", setor: "Transversal", tone: "primary",
      text: `${p.estagiariosCount} estagiários ativos. Avalie programa de efetivação para reter talento de baixo custo com produtividade comparável aos juniores.`,
    });
  }

  if (p.setorMaiorCO2) {
    cards.push({
      tag: "ESG", setor: p.setorMaiorCO2.setor, tone: "warning",
      text: `Concentra ${fmtNum((p.setorMaiorCO2.co2Total / p.totalCO2) * 100, 1)}% do CO₂. Plano de eficiência energética e logística reduziria meta corporativa rapidamente.`,
    });
  }

  if (p.outliersCount > 0) {
    cards.push({
      tag: "Outliers", setor: "Transversal", tone: "warning",
      text: `${p.outliersCount} colaboradores com custo total fora do padrão (IQR 1.5×). Vale auditar horas extras, adicionais e benefícios.`,
    });
  }

  if (p.setorMelhorCB) {
    cards.push({
      tag: "Benchmark interno", setor: p.setorMelhorCB.setor, tone: "primary",
      text: `Modelo a estudar — melhor custo/resultado da empresa. Replique práticas de gestão e composição de equipe nos setores menos eficientes.`,
    });
  }

  return { summary, cards };
}

export default Index;
