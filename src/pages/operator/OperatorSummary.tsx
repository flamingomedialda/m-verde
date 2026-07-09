import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { ChevronLeft, Recycle, Scale, Coins, Users } from "lucide-react";
import { store, getCurrentUser, formatWeight, type Deposit } from "@/lib/mockData";

export default function OperatorSummary() {
  const nav = useNavigate();
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== "operator") { nav("/"); return; }
    const today = new Date().toDateString();
    setDeposits(store.get().deposits
      .filter((d) => d.operatorId === u.id && new Date(d.date).toDateString() === today)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date)));
  }, [nav]);

  const totalG = deposits.reduce((a, d) => a + d.weightG, 0);
  const totalPts = deposits.reduce((a, d) => a + d.points, 0);
  const uniqueCitizens = new Set(deposits.map((d) => d.citizenId)).size;

  return (
    <MobileShell withNav={false}>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => nav("/operator")} className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Resumo de hoje</div>
          <div className="font-semibold text-lg">{new Date().toLocaleDateString("pt-PT", { dateStyle: "full" })}</div>
        </div>
      </header>

      <section className="px-5 mt-2 grid grid-cols-2 gap-3">
        <Stat label="Depósitos" value={String(deposits.length)} icon={Recycle} tone="green" />
        <Stat label="Peso total" value={formatWeight(totalG)} icon={Scale} tone="blue" />
        <Stat label="Pontos atribuídos" value={String(totalPts)} icon={Coins} tone="green" />
        <Stat label="Cidadãos" value={String(uniqueCitizens)} icon={Users} tone="blue" />
      </section>

      <section className="px-5 mt-5 pb-10">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Lista de depósitos</h3>
        {deposits.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground bg-card rounded-3xl shadow-card">
            Ainda não registou depósitos hoje.
          </div>
        )}
        <div className="space-y-2">
          {deposits.map((d) => (
            <div key={d.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent text-primary flex items-center justify-center font-bold">{d.citizenName[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{d.citizenName}</div>
                <div className="text-xs text-muted-foreground truncate">{d.materials.join(", ")} · {new Date(d.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{formatWeight(d.weightG)}</div>
                <div className="text-xs text-primary font-semibold">+{d.points} pts</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: "green" | "blue" }) {
  const map = { green: "bg-accent text-primary", blue: "bg-info/10 text-info" };
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className={`h-9 w-9 rounded-xl ${map[tone]} flex items-center justify-center mb-2`}><Icon className="h-4 w-4" /></div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-xl font-extrabold leading-tight">{value}</div>
    </div>
  );
}
