import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { User as UserIcon, Plus, Search, UserMinus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { listOperators, setUserRole, updateProfile } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/types";

export default function AdminOperators() {
  const [ops, setOps] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Add operator dialog
  const [addOpen, setAddOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState("+258");
  const [found, setFound] = useState<Profile | null>(null);
  const [newArea, setNewArea] = useState("");
  const [busy, setBusy] = useState(false);

  // Edit area per operator
  const [editAreas, setEditAreas] = useState<Record<string, string>>({});

  const reload = async () => {
    setLoading(true);
    try { setOps(await listOperators()); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const findCitizen = async () => {
    setFound(null);
    const p = searchPhone.trim();
    if (!p) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("phone", p).maybeSingle();
    if (error) return toast.error(error.message);
    if (!data) return toast.error("Nenhum utilizador com esse telemóvel");
    setFound(data as Profile);
    setNewArea((data as Profile).area ?? "");
  };

  const promote = async () => {
    if (!found) return;
    setBusy(true);
    try {
      await setUserRole(found.id, "operator");
      if (newArea.trim()) await updateProfile(found.id, { area: newArea.trim() });
      toast.success(`${found.name || "Utilizador"} promovido a operador`);
      setAddOpen(false); setFound(null); setSearchPhone("+258"); setNewArea("");
      reload();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const saveArea = async (id: string) => {
    const val = (editAreas[id] ?? "").trim();
    try {
      await updateProfile(id, { area: val });
      toast.success("Zona actualizada");
      setEditAreas((s) => { const c = { ...s }; delete c[id]; return c; });
      reload();
    } catch (e) { toast.error((e as Error).message); }
  };

  const demote = async (p: Profile) => {
    try {
      await setUserRole(p.id, "citizen");
      toast.success(`${p.name || "Operador"} despromovido`);
      reload();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Operadores</h1>
            <p className="text-sm text-muted-foreground mt-1">Promover cidadãos a operadores e gerir as suas zonas.</p>
          </div>
          <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) { setFound(null); setSearchPhone("+258"); setNewArea(""); } }}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl"><Plus className="h-4 w-4" /> Adicionar operador</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Promover cidadão a operador</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Telemóvel do utilizador</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="+258 ..." />
                    <Button type="button" onClick={findCitizen} variant="secondary">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {found && (
                  <>
                    <div className="bg-muted rounded-2xl p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl gradient-green text-white flex items-center justify-center font-bold">
                        {(found.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{found.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{found.phone ?? "—"}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Zona de actuação</Label>
                      <Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Ex: KaMaxakeni" />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
                <Button onClick={promote} disabled={!found || busy}>{busy ? "A promover…" : "Promover"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading && <div className="text-sm text-muted-foreground">A carregar…</div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ops.map((o) => {
            const editing = editAreas[o.id] !== undefined;
            return (
              <div key={o.id} className="bg-card rounded-3xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl gradient-blue text-white flex items-center justify-center"><UserIcon className="h-6 w-6" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{o.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.phone ?? "—"}</div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Activo</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Zona</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={editing ? editAreas[o.id] : (o.area ?? "")}
                        onChange={(e) => setEditAreas((s) => ({ ...s, [o.id]: e.target.value }))}
                        placeholder="Zona"
                        className="h-9"
                      />
                      {editing && (
                        <Button size="sm" onClick={() => saveArea(o.id)}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-2 text-danger border-danger/40">
                        <UserMinus className="h-4 w-4" /> Despromover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Despromover operador?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {o.name || "Este utilizador"} voltará a ter apenas o papel de cidadão.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => demote(o)}>Despromover</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
          {!loading && ops.length === 0 && <div className="text-sm text-muted-foreground">Ainda sem operadores.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
