import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listOperators } from "@/lib/api";
import type { Profile } from "@/lib/types";

export default function AdminOperators() {
  const [ops, setOps] = useState<Profile[]>([]);
  useEffect(() => { listOperators().then(setOps).catch(() => {}); }, []);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Operadores</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Para promover um utilizador a operador, use o SQL Editor do Supabase:
              <br />
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">insert into user_roles(user_id, role) select id, 'operator' from auth.users where email='...'</code>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ops.map((o) => (
            <div key={o.id} className="bg-card rounded-3xl p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl gradient-blue text-white flex items-center justify-center"><UserIcon className="h-6 w-6" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{o.name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{o.phone ?? "—"}</div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Zona</span><span className="font-semibold">{o.area ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge className="bg-success text-success-foreground">Activo</Badge></div>
              </div>
            </div>
          ))}
          {ops.length === 0 && <div className="text-sm text-muted-foreground">Ainda sem operadores.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
