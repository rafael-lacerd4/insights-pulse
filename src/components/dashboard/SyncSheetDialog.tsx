import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SyncSheetDialog = () => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [sheet, setSheet] = useState("base");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase.from("dataset_meta").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data?.spreadsheet_id) setUrl(`https://docs.google.com/spreadsheets/d/${data.spreadsheet_id}/edit`);
      if (data?.sheet_name) setSheet(data.sheet_name);
    });
  }, [open]);

  const onSync = async () => {
    if (!url.trim()) { toast.error("Cole a URL da planilha"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-sheet", {
        body: { spreadsheet_id: url.trim(), sheet_name: sheet.trim() || "base" },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Falha desconhecida");
      toast.success(`Sincronizado: ${data.total} linhas`);
      setOpen(false);
    } catch (e: any) {
      toast.error(`Erro: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover:border-primary/50 hover:text-primary">
          <Cloud className="h-4 w-4" />
          Fonte
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sincronizar com Google Sheets</DialogTitle>
          <DialogDescription>
            Cole o link da planilha do Google Sheets que vai alimentar o dashboard. O dashboard atualiza sozinho a cada sync.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sheet-url">URL da planilha</Label>
            <Input id="sheet-url" placeholder="https://docs.google.com/spreadsheets/d/..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sheet-tab">Nome da aba</Label>
            <Input id="sheet-tab" placeholder="base" value={sheet} onChange={(e) => setSheet(e.target.value)} />
            <p className="text-xs text-muted-foreground">A aba precisa ter os cabeçalhos: Funcionario, Setor, Cargo, Tempo Empresa, Salario Base, Produtividade, Custo Total, Emissao CO2 etc. (mesmas colunas da planilha original).</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={onSync} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
            {busy ? "Sincronizando…" : "Sincronizar agora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};