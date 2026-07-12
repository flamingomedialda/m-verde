import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { Bell, Plus, Trash2, Droplets, HeartPulse, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { listAlerts, createAlert, deleteAlert } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { AlertItem } from "@/lib/types";

const sev = {
  critical: "bg-danger/10 text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-info/10 text-info",
} as const;

const TYPES = [
  { id: "flooding", label: "Cheias", icon: Droplets, sev: "critical" as const },
  { id: "trash", label: "Acumulação de lixo", icon: Trash2, sev: "medium" as const },
  { id: "health", label: "Risco para a saúde", icon: HeartPulse, sev: "critical" as const },
  { id: "drainage", label: "Drenagem bloqueada", icon: AlertTriangle, sev: "medium" as const },
];

export default function AdminAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [type, setType] = useState(TYPES[0].id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "critical">("medium");
  const [area, setArea] = useState("");

  const reload = () => listAlerts().then(setAlerts).catch(() => {});
  useEffect(() => { reload(); }, []);

  const resetForm = () => {
    setType(TYPES[0].id); setTitle(""); setDescription("");
    setSeverity("medium"); setArea("");
  };

  const submit = async () => {
    if (!title.trim()) return toast.error("Indique o título");
    setBusy(true);
    try {
      await createAlert({
        operator_id: user?.id ?? null,
        type, title: title.trim(),
        description: description.trim() || null,
        severity, area: area.trim() || null,
        lat: null, lng: null,
      });
      toast.success("Alerta criado");
      setOpen(false); resetForm(); reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    try {
      await deleteAlert(id);
      toast.success("Alerta removido");
      reload();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Alertas</h1>
            <p className="text-sm text-muted-foreground mt-1">Criar, validar e gerir alertas ambientais</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl"><Plus className="h-4 w-4" /> Novo alerta</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Novo alerta</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-1.5 block">Tipo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map((t) => {
                      const Icon = t.icon; const sel = type === t.id;
                      return (
                        <button key={t.id} type="button"
                          onClick={() => { setType(t.id); setSeverity(t.sev); if (!title) setTitle(t.label); }}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm text-left ${sel ? "border-primary bg-accent" : "border-border bg-card"}`}>
                          <Icon className="h-4 w-4" /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Acumulação de lixo em..." />
                </div>
                <div>
                  <Label className="text-sm">Zona / Bairro</Label>
                  <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex: KaMaxakeni" />
                </div>
                <div>
                  <Label className="text-sm">Severidade</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {(["low","medium","critical"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => setSeverity(s)}
                        className={`py-2 rounded-xl border-2 text-xs font-semibold uppercase ${severity === s ? "border-primary bg-accent" : "border-border bg-card"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Descrição</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submit} disabled={busy}>{busy ? "A guardar…" : "Publicar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-card rounded-3xl p-5 shadow-card flex items-start gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${sev[a.severity]}`}><Bell className="h-6 w-6" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{a.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sev[a.severity]}`}>{a.severity}</span>
                </div>
                {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                <div className="text-xs text-muted-foreground mt-2">📍 {a.area ?? "—"} · {new Date(a.date).toLocaleString("pt-PT")}</div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="h-9 w-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center tap-scale" aria-label="Apagar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apagar alerta?</AlertDialogTitle>
                    <AlertDialogDescription>Esta acção é permanente.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(a.id)}>Apagar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          {alerts.length === 0 && <div className="text-muted-foreground text-sm">Sem alertas.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
