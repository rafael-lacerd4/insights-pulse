import { useEffect, useState, useCallback } from "react";
import { fetchDataset, type Dataset } from "@/lib/dataset";

export function useDataset() {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchDataset();
      setData(d);
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, updatedAt };
}