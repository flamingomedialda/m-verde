import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { Search, Shield, ShieldOff, Ban, CheckCircle2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { listAllUsers, setBlocked, setUserRole, type UserWithRole } from "@/lib/api";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin", operator: "Operador", citizen: "Cidadão",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | Role>("all");
  const [filterState, setFilterState] = useState<"all" | "active" | "blocked">("all");

  const reload = async () => {
    setLoading(true);
    try { setUsers(await listAllUsers()); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => users.filter((u) => {
    if (filterRole !== "all" && u.effective_role !== filterRole) return false;
    if (filterState === "active" && u.blocked) return false;
    if (filterState === "blocked" && !u.blocked) return false;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      if (!(u.name?.toLowerCase().includes(s) || u.phone?.toLowerCase().includes(s))) return false;
    }
    return true;
  }), [users, filterRole, filterState, q]);

  const promote = async (u: UserWithRole, role: Role) => {
    try { await setUserRole(u.id, role); toast.success(`${u.name || "Utilizador"} agora é ${ROLE_LABEL[role]}`); reload(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const toggleBlock = async (u: UserWithRole) => {
    try { await setBlocked(u.id, !u.blocked); toast.success(u.blocked ? "Utilizador desbloqueado" : "Utilizador bloqueado"); reload(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Utilizadores</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir todos os utilizadores da plataforma.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome ou telemóvel" className="pl-9" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as "all" | Role)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="all">Todos os papéis</option>
            <option value="citizen">Cidadão</option>
            <option value="operator">Operador</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filterState} onChange={(e) => setFilterState(e.target.value as "all" | "active" | "blocked")}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="blocked">Bloqueados</option>
          </select>
          <div className="text-sm text-muted-foreground self-center ml-auto">{filtered.length} de {users.length}</div>
        </div>

        {loading && <div className="text-sm text-muted-foreground">A carregar…</div>}

        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_120px_120px_260px] px-5 py-3 text-xs font-semibold text-muted-foreground uppercase border-b">
            <div>Utilizador</div><div>Telemóvel</div><div>Papel</div><div>Estado</div><div className="text-right">Acções</div>
          </div>
          <div className="divide-y">
            {filtered.map((u) => (
              <div key={u.id} className="grid md:grid-cols-[1fr_140px_120px_120px_260px] items-center gap-2 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl gradient-green text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {(u.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{u.name || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.area ?? "—"}</div>
                  </div>
                </div>
                <div className="text-sm">{u.phone ?? "—"}</div>
                <div>
                  <Badge variant="secondary" className={u.effective_role === "admin" ? "bg-danger/10 text-danger" : u.effective_role === "operator" ? "bg-info/10 text-info" : ""}>
                    {u.effective_role ? ROLE_LABEL[u.effective_role] : "—"}
                  </Badge>
                </div>
                <div>
                  {u.blocked
                    ? <Badge className="bg-danger text-danger-foreground">Bloqueado</Badge>
                    : <Badge className="bg-success text-success-foreground">Activo</Badge>}
                </div>
                <div className="flex flex-wrap gap-1.5 md:justify-end">
                  {u.effective_role !== "admin" && (
                    <Button size="sm" variant="secondary" onClick={() => promote(u, "admin")}><Shield className="h-3.5 w-3.5" /> Admin</Button>
                  )}
                  {u.effective_role === "admin" && (
                    <Button size="sm" variant="outline" onClick={() => promote(u, "citizen")}><ShieldOff className="h-3.5 w-3.5" /> Despromover</Button>
                  )}
                  <Button size="sm" variant={u.blocked ? "outline" : "destructive"} onClick={() => toggleBlock(u)}>
                    {u.blocked ? <><CheckCircle2 className="h-3.5 w-3.5" /> Desbloquear</> : <><Ban className="h-3.5 w-3.5" /> Bloquear</>}
                  </Button>
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-10 flex flex-col items-center gap-2">
                <UserIcon className="h-6 w-6" /> Nenhum utilizador encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
