import { useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { store, type User } from "@/lib/mockData";
import { Plus, User as UserIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function emptyOp(epId?: string): User {
  return { id: "", name: "", phone: "+258", role: "operator", area: "Maputo", points: 0, totalG: 0, reportsCount: 0, ecoPointId: epId };
}

export default function AdminOperators() {
  const [ops, setOps] = useState(store.get().users.filter((u) => u.role === "operator"));
  const eps = store.get().ecoPoints;
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const refresh = () => setOps(store.get().users.filter((u) => u.role === "operator"));

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || editing.phone.length < 8) return toast.error("Nome e telefone obrigatórios");
    store.update((s) => {
      if (editing.id) { const i = s.users.findIndex((u) => u.id === editing.id); if (i >= 0) s.users[i] = editing; }
      else s.users.push({ ...editing, id: "u" + Date.now() });
    });
    refresh(); setEditing(null); toast.success("Operador guardado");
  };
  const confirmDelete = () => {
    if (!deleting) return;
    store.update((s) => { s.users = s.users.filter((u) => u.id !== deleting.id); });
    refresh(); setDeleting(null); toast.success("Operador removido");
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-3xl font-bold">Operadores</h1><p className="text-sm text-muted-foreground mt-1">Gerir e atribuir operadores</p></div>
          <Button onClick={() => setEditing(emptyOp(eps[0]?.id))} className="rounded-xl h-11"><Plus className="h-4 w-4" /> Criar operador</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ops.map((o) => {
            const ep = eps.find((e) => e.id === o.ecoPointId);
            return (
              <div key={o.id} className="bg-card rounded-3xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl gradient-blue text-white flex items-center justify-center"><UserIcon className="h-6 w-6" /></div>
                  <div className="flex-1 min-w-0"><div className="font-bold truncate">{o.name}</div><div className="text-xs text-muted-foreground">{o.phone}</div></div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Eco Ponto</span><span className="font-semibold text-right truncate ml-2">{ep?.name ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Zona</span><span className="font-semibold">{o.area}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge className="bg-success text-success-foreground">Activo</Badge></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing({ ...o })}><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-danger" onClick={() => setDeleting(o)}><Trash2 className="h-3.5 w-3.5" /> Apagar</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar operador" : "Criar operador"}</DialogTitle><DialogDescription>Dados do operador KUBASILE.</DialogDescription></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Telefone (+258...)</Label><Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div><Label>Zona</Label><Input value={editing.area ?? ""} onChange={(e) => setEditing({ ...editing, area: e.target.value })} placeholder="Ex: Maputo - KaMpfumo" /></div>
              <div><Label>Eco Ponto atribuído</Label>
                <Select value={editing.ecoPointId ?? ""} onValueChange={(v) => setEditing({ ...editing, ecoPointId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{eps.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apagar operador?</DialogTitle><DialogDescription><b>{deleting?.name}</b> será removido.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Apagar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
