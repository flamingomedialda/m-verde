import { AdminLayout } from "@/components/AdminSidebar";
import { store } from "@/lib/mockData";
import { Bell } from "lucide-react";

const sev = { critical: "bg-danger/10 text-danger", medium: "bg-warning/10 text-warning", low: "bg-info/10 text-info" } as const;

export default function AdminAlerts() {
  const alerts = store.get().alerts;
  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Validar e gerir alertas ambientais</p>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-card rounded-3xl p-5 shadow-card flex items-start gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${sev[a.severity]}`}><Bell className="h-6 w-6" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold">{a.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sev[a.severity]}`}>{a.severity}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                <div className="text-xs text-muted-foreground mt-2">📍 {a.area} · {new Date(a.date).toLocaleString("pt-PT")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
