import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminSidebar";
import { getCurrentUser, store, formatWeight } from "@/lib/mockData";
import { Recycle, Users, FileWarning, AlertTriangle, MapPin } from "lucide-react";
import { OLMap } from "@/components/OLMap";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [s, setS] = useState(() => store.get());
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) nav("/");
    else if (u.role !== "admin") nav(u.role === "operator" ? "/operator" : "/home");
    else setS(store.get());
  }, [nav]);

  const totalG = s.deposits.reduce((a, d) => a + d.weightG, 0);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Vista geral do sistema KUBASILE</p>
          </div>
          <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString("pt-PT", { dateStyle: "full" })}</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi label="Volume reciclado" value={formatWeight(totalG)} icon={Recycle} tone="green" />
          <Kpi label="Cidadãos" value={String(s.users.filter((u) => u.role === "citizen").length)} icon={Users} tone="blue" />
          <Kpi label="Reportes" value={String(s.reports.length)} icon={FileWarning} tone="yellow" />
          <Kpi label="Zonas críticas" value={String(s.alerts.filter((a) => a.severity === "critical").length)} icon={AlertTriangle} tone="red" />
          <Kpi label="Eco Pontos activos" value={String(s.ecoPoints.filter((e) => e.active).length)} icon={MapPin} tone="green" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mt-6">
          <div className="bg-card rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Mapa de Eco Pontos</h3>
            <div className="rounded-2xl overflow-hidden">
              <OLMap height={320} showMyLocation markers={s.ecoPoints.map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, color: e.active ? "#16a34a" : "#94a3b8" }))} />
            </div>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Últimos depósitos</h3>
            <div className="divide-y divide-border">
              {s.deposits.slice(0, 6).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-sm">{d.citizenName}</div>
                    <div className="text-xs text-muted-foreground">{d.materials.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatWeight(d.weightG)}</div>
                    <div className="text-xs text-primary font-semibold">+{d.points} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: "green" | "blue" | "red" | "yellow" }) {
  const map = { green: "bg-accent text-primary", blue: "bg-info/10 text-info", red: "bg-danger/10 text-danger", yellow: "bg-warning/10 text-warning" };
  return (
    <div className="bg-card rounded-3xl p-5 shadow-card">
      <div className={`h-10 w-10 rounded-xl ${map[tone]} flex items-center justify-center`}><Icon className="h-5 w-5" /></div>
      <div className="text-xs text-muted-foreground mt-3">{label}</div>
      <div className="text-2xl font-extrabold mt-0.5">{value}</div>
    </div>
  );
}
