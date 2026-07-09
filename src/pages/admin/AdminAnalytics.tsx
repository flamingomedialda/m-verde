import { AdminLayout } from "@/components/AdminSidebar";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo } from "react";

const dist = [
  { name: "Plástico", v: 45, c: "#16a34a" },
  { name: "Vidro", v: 25, c: "#2563eb" },
  { name: "Papel", v: 20, c: "#eab308" },
  { name: "Metal", v: 10, c: "#dc2626" },
];

export default function AdminAnalytics() {
  const trend = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    m: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i],
    recycleG: (i + 1) * 12000 + 30000,
    reports: 20 + i * 3,
  })), []);
  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Tendências e indicadores</p>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-3xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Reciclagem (12 meses) — gramas</h3>
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
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dist} dataKey="v" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {dist.map((d) => <Cell key={d.name} fill={d.c} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
