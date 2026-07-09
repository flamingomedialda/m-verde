import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Bell, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { deleteAlert } from "@/lib/api";
import type { AlertItem } from "@/lib/types";

const sevStyle = {
  critical: "bg-danger/10 text-danger",
  medium: "bg-warning/10 text-warning",
  low: "bg-info/10 text-info",
} as const;

export default function OperatorAlerts() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("alerts").select("*").eq("operator_id", user.id).order("date", { ascending: false });
    setAlerts((data ?? []) as AlertItem[]);
  };

  useEffect(() => { refresh(); }, [user]);

  const remove = async (id: string) => {
    try { await deleteAlert(id); await refresh(); toast.success("Alerta removido"); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <MobileShell withNav={false}>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => nav("/operator")} className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Os meus alertas</div>
          <div className="font-semibold text-lg">Alertas publicados</div>
        </div>
      </header>

      <div className="px-5">
        <Link to="/operator/alert/new" className="block tap-scale">
          <div className="rounded-3xl p-5 gradient-red text-white shadow-soft flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center"><Plus className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="font-bold text-lg leading-tight">Novo alerta</div>
              <div className="text-xs text-white/85">Reportar risco ambiental à comunidade</div>
            </div>
          </div>
        </Link>
      </div>

      <section className="px-5 mt-5 space-y-3 pb-10">
        {alerts.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            Ainda não publicou nenhum alerta.
          </div>
        )}
        {alerts.map((a) => (
          <article key={a.id} className="bg-card rounded-3xl p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${sevStyle[a.severity]}`}><Bell className="h-6 w-6" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold leading-tight">{a.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sevStyle[a.severity]}`}>{a.severity}</span>
                </div>
                {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {a.area ?? "—"} · {new Date(a.date).toLocaleString("pt-PT")}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-danger" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </article>
        ))}
      </section>
    </MobileShell>
  );
}
