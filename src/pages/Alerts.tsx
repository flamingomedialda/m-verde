import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { listAlerts } from "@/lib/api";
import type { AlertItem } from "@/lib/types";

const sev = {
  critical: { bg: "bg-danger/10", text: "text-danger", label: "Crítico", ring: "ring-danger/30" },
  medium: { bg: "bg-warning/10", text: "text-warning", label: "Médio", ring: "ring-warning/30" },
  low: { bg: "bg-info/10", text: "text-info", label: "Baixo", ring: "ring-info/30" },
} as const;

export default function Alerts() {
  const [items, setItems] = useState<AlertItem[]>([]);
  useEffect(() => { listAlerts().then(setItems).catch(() => {}); }, []);

  return (
    <MobileShell>
      <PageHeader title="Alertas" subtitle="Avisos ambientais na sua zona" />
      <section className="px-5 space-y-3">
        {items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">Sem alertas.</div>
        )}
        {items.map((a) => {
          const s = sev[a.severity];
          return (
            <article key={a.id} className="bg-card rounded-3xl p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className={`h-12 w-12 rounded-2xl ${s.bg} ${s.text} flex items-center justify-center shrink-0 ring-4 ${s.ring}`}><Bell className="h-6 w-6" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold leading-tight">{a.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                  </div>
                  {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-2">
                    <span>📍 {a.area ?? "—"}</span>
                    <span>·</span>
                    <span>{new Date(a.date).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <BottomNav />
    </MobileShell>
  );
}
