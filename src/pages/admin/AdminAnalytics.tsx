import { AdminLayout } from "@/components/AdminSidebar";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { listAllDeposits, listAllReports } from "@/lib/api";
import type { Deposit, Report } from "@/lib/types";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MATERIAL_COLORS: Record<string, string> = {
  "Plástico": "#16a34a",
  "Vidro": "#2563eb",
  "Papel": "#eab308",
  "Metal": "#dc2626",
};

export default function AdminAnalytics() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, r] = await Promise.all([listAllDeposits(), listAllReports()]);
        setDeposits(d);
        setReports(r);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 12-month trend (current year)
  const trend = useMemo(() => {
    const year = new Date().getFullYear();
    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      m: MONTHS[i], recycleG: 0, reports: 0,
    }));
    for (const d of deposits) {
      const dt = new Date(d.date);
      if (dt.getFullYear() === year) byMonth[dt.getMonth()].recycleG += d.weight_g;
    }
    for (const r of reports) {
      const dt = new Date(r.date);
      if (dt.getFullYear() === year) byMonth[dt.getMonth()].reports += 1;
    }
    return byMonth;
  }, [deposits, reports]);

  // Materials distribution
  const dist = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const d of deposits) {
      // if multiple materials, split weight evenly across them
      const w = d.materials.length > 0 ? d.weight_g / d.materials.length : d.weight_g;
      for (const m of d.materials) totals[m] = (totals[m] ?? 0) + w;
    }
    return Object.entries(totals).map(([name, v]) => ({
      name, v: Math.round(v), c: MATERIAL_COLORS[name] ?? "#64748b",
    }));
  }, [deposits]);

  const totalG = deposits.reduce((a, d) => a + d.weight_g, 0);
  const totalPts = deposits.reduce((a, d) => a + d.points, 0);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Tendências e indicadores em tempo real</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Kpi label="Depósitos" value={String(deposits.length)} />
          <Kpi label="Peso total" value={`${(totalG / 1000).toFixed(1)} kg`} />
          <Kpi label="Pontos gerados" value={String(totalPts)} />
          <Kpi label="Reportes" value={String(reports.length)} />
        </div>

        {loading && <div className="text-sm text-muted-foreground mb-4">A carregar dados…</div>}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Reciclagem ({new Date().getFullYear()}) — gramas</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="recycleG" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Distribuição de materiais</h3>
            {dist.length === 0 ? (
              <div className="text-sm text-muted-foreground py-10 text-center">Sem depósitos ainda.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={dist} dataKey="v" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {dist.map((d) => <Cell key={d.name} fill={d.c} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="lg:col-span-3 bg-card rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Reportes ambientais por mês</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="reports" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-3xl p-5 shadow-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
