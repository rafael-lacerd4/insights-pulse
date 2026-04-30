# 📊 Insights Pulse — HR Executive BI

> Dashboard de Inteligência Gerencial para Análise de Capital Humano, Custos e Sustentabilidade

**🔗 Live Demo:** [insights-pulse-71.lovable.app](https://insights-pulse-71.lovable.app/)

---

## 🧭 Sobre o Projeto

O **Insights Pulse** é um sistema de Business Intelligence voltado para a gestão estratégica de pessoas, desenvolvido como projeto final do curso **Análise de Dados e Inteligência Artificial Aplicada à Sustentabilidade**.

A base de dados contém **1.200 funcionários** distribuídos em 8 setores corporativos. O pipeline completo passou por auditoria técnica com **99,25% de integridade confirmada**, e os resultados foram entregues em um dashboard executivo interativo.

O projeto cobre três dimensões críticas para qualquer organização:

- **Financeira** — Custo total e custo por resultado por setor
- **Operacional** — Produtividade média, padrões de alto custo e baixa entrega
- **Ambiental** — Emissões de CO₂ por setor, identificação de ineficiência ambiental estrutural

---

## 🚨 Diagnóstico Central (KPIs por Setor)

| Setor | Headcount | Custo Total | Prod. Média | CO₂ Total (kg) | Custo/Resultado |
|---|---|---|---|---|---|
| TI | 130 | R$ 2.485.397 | 62,6 | 3.979,50 | R$ 305,59 |
| Operações | 250 | R$ 2.164.826 | 53,4 | **19.460,18** | R$ 162,27 |
| Financeiro | 120 | R$ 1.875.104 | 57,4 | 2.091,93 | R$ 272,03 |
| Comercial | 160 | R$ 1.801.432 | 58,5 | 3.492,68 | R$ 192,52 |
| Logística | 180 | R$ 1.755.928 | 54,8 | 12.513,44 | R$ 177,99 |
| Administrativo | 160 | R$ 1.161.954 | 46,7 | 2.149,19 | R$ 155,36 |
| RH | 90 | R$ 1.066.432 | 51,6 | 1.213,83 | R$ 229,74 |
| Atendimento | 110 | R$ 676.595 | **43,2** | 1.241,36 | **R$ 142,50** |

**Custo total da empresa: R$ 12.987.666,82**

### Padrões Críticos Identificados

- **TI** é o setor mais caro (19,1% do custo total) com o pior custo por resultado (R$ 305,59/unidade)
- **Atendimento** tem a menor produtividade média (43,2 pts) mas o melhor custo-benefício (R$ 142,50)
- **Operações + Logística** concentram **69,2% das emissões de CO₂** com apenas 36% do headcount
- **47 funcionários** se enquadram no padrão crítico: alto custo (acima do P75) + baixa produtividade (abaixo do P25)
- **RH** apresenta custo acima da média com produtividade abaixo da média — ineficiência estrutural confirmada

---

## 🛠️ Stack Tecnológica

### Pipeline de Dados (Python)
- `pandas` — limpeza, transformação e validação de dados
- `numpy` — cálculos estatísticos (percentis, correlações, quintis)
- Auditoria automatizada: cruzamento entre base original e base processada
- Geração de métricas derivadas: `Score_Desperdicio`, `Faixa_Desperdicio`, `Alerta_Qualidade`

### Dashboard (Frontend)
- **React** + **TypeScript** — componentes e lógica de interface
- **Vite** — build tool
- **Tailwind CSS** — estilização utilitária
- **shadcn/ui** — componentes de UI
- **Supabase** — banco de dados e backend
- **Lovable** — plataforma de deploy

---

## 📁 Estrutura do Projeto

```
insights-pulse/
├── src/
│   ├── components/     # Componentes do dashboard
│   ├── pages/          # Páginas da aplicação
│   └── ...
├── supabase/           # Configurações do banco de dados
├── public/             # Assets estáticos
└── ...
```

---

## 🔍 Auditoria de Dados

A integridade dos dados foi verificada em 8 etapas formais:

| Critério | Resultado | Status |
|---|---|---|
| Registros totais | 1.200 / 1.200 | ✅ OK |
| Nulos em qualquer coluna | 0 | ✅ OK |
| Duplicatas absolutas | 0 | ✅ OK |
| Tipos de dados consistentes | 20/20 colunas | ✅ OK |
| Custo Total (validação cruzada) | R$ 12.987.666,82 — idêntico | ✅ OK |
| Registros com dados divergentes | 9 (0,75%) | ⚠️ Atenção |
| Colunas ausentes na base processada | 3 métricas derivadas | ⚠️ Atenção |

**Veredicto:** Base aprovada para uso analítico com confiabilidade de 99,25%.

---

## 👥 Time

Projeto desenvolvido pelo **Setor de Dados** — turma de **Análise de Dados e Inteligência Artificial Aplicada à Sustentabilidade**

- Rafael Lacerda Silva
- Miguel
- Felipe

---

## 📄 Licença

Projeto acadêmico — uso educacional.
