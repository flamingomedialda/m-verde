import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { getCurrentUser, store, logout, formatWeight, type User } from "@/lib/mockData";
import { PackagePlus, AlertTriangle, BarChart3, LogOut, Recycle, Bell } from "lucide-react";

export default function OperatorHome() {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ deposits: 0, g: 0, alerts: 0 });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { nav("/"); return; }
    if (u.role !== "operator") { nav(u.role === "admin" ? "/admin" : "/home"); return; }
    setUser(u);
    const s = store.get();
    const today = new Date().toDateString();
    const todays = s.deposits.filter((d) => new Date(d.date).toDateString() === today);
    setStats({
      deposits: todays.length,
      g: todays.reduce((a, d) => a + d.weightG, 0),
      alerts: s.alerts.filter((a) => a.operatorId === u.id).length,
    });
  }, [nav]);

  if (!user) return null;

  return (
    <MobileShell withNav={false}>
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Operador</div>
          <div className="font-bold text-lg leading-tight">{user.name}</div>
        </div>
        <button onClick={() => { logout(); nav("/"); }} className="h-11 w-11 rounded-2xl bg-card shadow-card flex items-center justify-center">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <section className="px-5 mt-4 grid grid-cols-3 gap-2">
        <Kpi label="Depósitos hoje" value={String(stats.deposits)} icon={Recycle} tone="green" />
        <Kpi label="Recolhido" value={formatWeight(stats.g)} icon={BarChart3} tone="blue" />
        <Kpi label="Meus alertas" value={String(stats.alerts)} icon={Bell} tone="red" />
      </section>

      <section className="px-5 mt-6">
        <Link to="/operator/deposit" className="block tap-scale">
          <div className="rounded-3xl p-6 gradient-green text-white shadow-soft relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="text-sm text-white/80">Acção principal</div>
              <div className="text-2xl font-extrabold mt-1">Novo Depósito</div>
              <p className="text-sm text-white/90 mt-2">Registar reciclagem para um cidadão</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-sm font-semibold">
                <PackagePlus className="h-4 w-4" /> Iniciar
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <Link to="/operator/alert" className="block tap-scale">
          <div className="bg-card rounded-3xl p-4 shadow-card h-full">
            <div className="h-12 w-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-3"><AlertTriangle className="h-6 w-6" /></div>
            <div className="font-semibold">Criar Alerta</div>
            <div className="text-xs text-muted-foreground">Risco ambiental</div>
          </div>
        </Link>
        <Link to="/operator/summary" className="block tap-scale">
          <div className="bg-card rounded-3xl p-4 shadow-card h-full">
            <div className="h-12 w-12 rounded-2xl bg-info/10 text-info flex items-center justify-center mb-3"><BarChart3 className="h-6 w-6" /></div>
            <div className="font-semibold">Resumo diário</div>
            <div className="text-xs text-muted-foreground">{formatWeight(stats.g)} · {stats.deposits} dep.</div>
          </div>
        </Link>
      </section>

      <div className="h-6" />
    </MobileShell>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: "green" | "blue" | "red" }) {
  const map = { green: "text-primary bg-accent", blue: "text-info bg-info/10", red: "text-danger bg-danger/10" };
  return (
    <div className="bg-card rounded-2xl p-3 shadow-card">
      <div className={`h-8 w-8 rounded-xl ${map[tone]} flex items-center justify-center mb-2`}><Icon className="h-4 w-4" /></div>
      <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      <div className="text-lg font-extrabold leading-tight">{value}</div>
    </div>
  );
}
