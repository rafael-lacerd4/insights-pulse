import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

export const chartTheme = {
  grid: "rgba(148, 163, 184, 0.12)",
  text: "rgba(226, 232, 240, 0.85)",
  textMuted: "rgba(148, 163, 184, 0.7)",
};

export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: chartTheme.text, font: { family: "Inter", size: 11 } } },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(148, 163, 184, 0.2)",
      borderWidth: 1,
      titleFont: { family: "Space Grotesk", size: 13 },
      bodyFont: { family: "Inter", size: 12 },
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { color: chartTheme.grid },
      ticks: { color: chartTheme.textMuted, font: { family: "Inter", size: 11 } },
    },
    y: {
      grid: { color: chartTheme.grid },
      ticks: { color: chartTheme.textMuted, font: { family: "Inter", size: 11 } },
    },
  },
} as const;