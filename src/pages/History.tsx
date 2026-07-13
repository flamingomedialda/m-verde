import { useEffect, useMemo, useState } from "react";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { Recycle, FileWarning, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { listDepositsForCitizen, listRedemptionsForCitizen, listReportsForCitizen } from "@/lib/api";
import { formatWeight } from "@/lib/types";

interface Item { id: string; date: string; title: string; subtitle: string; kind: "deposit" | "report" | "redeem"; }

export default function History() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [deps, reps, reds] = await Promise.all([
        listDepositsForCitizen(userId),
        listReportsForCitizen(userId),
        listRedemptionsForCitizen(userId),
      ]);
      const list: Item[] = [];
      deps.forEach((d) => list.push({ id: d.id, date: d.date, title: `+${d.points} pontos`, subtitle: `Depósito de ${formatWeight(d.weight_g)} · ${d.materials.join(", ")}`, kind: "deposit" }));
      reps.forEach((r) => list.push({ id: r.id, date: r.date, title: "Reporte enviado", subtitle: `${r.type} · ${r.area ?? ""}`, kind: "report" }));
      reds.forEach((r) => list.push({ id: r.id, date: r.date, title: `Resgate: ${r.reward_name}`, subtitle: `-${r.points_cost} pontos`, kind: "redeem" }));
      list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
      setItems(list);
    })();
  }, [userId]);

  const grouped = useMemo(() => {
    const g: Record<string, Item[]> = {};
    items.forEach((i) => {
      const key = new Date(i.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
      (g[key] ||= []).push(i);
    });
    return g;
  }, [items]);

  return (
    <MobileShell>
      <PageHeader title="Histórico" subtitle="Atividade da sua conta" />
      <section className="px-5 space-y-5">
        {Object.entries(grouped).map(([day, list]) => (
          <div key={day}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{day}</div>
            <div className="bg-card rounded-3xl shadow-card divide-y divide-border">
              {list.map((it) => {
                const Icon = it.kind === "deposit" ? Recycle : it.kind === "redeem" ? Gift : FileWarning;
                const color = it.kind === "deposit" ? "text-primary bg-accent" : it.kind === "redeem" ? "text-info bg-info/10" : "text-warning bg-warning/10";
                return (
                  <div key={it.id} className="flex items-center gap-3 p-4">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-tight">{it.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{it.subtitle}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(it.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">Ainda sem atividade.</div>
        )}
      </section>
      <BottomNav />
    </MobileShell>
  );
}
