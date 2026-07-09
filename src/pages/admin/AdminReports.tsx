import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { FileWarning } from "lucide-react";
import { listAllReports } from "@/lib/api";
import type { Report } from "@/lib/types";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => { listAllReports().then(setReports).catch(() => {}); }, []);
  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Reportes ambientais da comunidade</p>
        <div className="grid md:grid-cols-2 gap-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-card rounded-3xl p-5 shadow-card flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0"><FileWarning className="h-6 w-6" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{r.type}</div>
                <div className="text-sm text-muted-foreground">{r.area ?? "—"}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(r.date).toLocaleString("pt-PT")}</div>
                <div className="text-[10px] uppercase font-bold mt-1 text-primary">{r.status}</div>
              </div>
            </div>
          ))}
          {reports.length === 0 && <div className="text-muted-foreground text-sm">Sem reportes ainda.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
