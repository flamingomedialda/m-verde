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
import { listOperators, listEcoPoints, setUserRole, updateProfile } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, EcoPoint } from "@/lib/types";

export default function AdminOperators() {
  const [ops, setOps] = useState<Profile[]>([]);
  const [ecoPoints, setEcoPoints] = useState<EcoPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Add operator dialog
  const [addOpen, setAddOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState("+258");
  const [found, setFound] = useState<Profile | null>(null);
  const [selectedEcoPointId, setSelectedEcoPointId] = useState("");
  const [busy, setBusy] = useState(false);

  // Edit associated Eco Point per operator
  const [editEcoPoints, setEditEcoPoints] = useState<Record<string, string>>({});

  const reload = async () => {
    setLoading(true);
    try {
      const [operatorsList, ecoPointsList] = await Promise.all([
        listOperators(),
        listEcoPoints(),
      ]);
      setOps(operatorsList);
      setEcoPoints(ecoPointsList);
    } catch (e) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
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
  };

  const promote = async () => {
    if (!found) return;
    if (!selectedEcoPointId) return toast.error("Por favor, selecione um Eco Ponto");
    
    const ep = ecoPoints.find((x) => x.id === selectedEcoPointId);
    if (!ep) return toast.error("Eco Ponto inválido");

    setBusy(true);
    try {
      // 1. Give operator role
      await setUserRole(found.id, "operator");
      
      // 2. Link operator to selected eco point & set operator's area to match
      await updateProfile(found.id, { 
        eco_point_id: selectedEcoPointId, 
        area: ep.area 
      });

      toast.success(`${found.name || "Utilizador"} promovido a operador`);
      setAddOpen(false); 
      setFound(null); 
      setSearchPhone("+258"); 
      setSelectedEcoPointId("");
      reload();
    } catch (e) { 
      toast.error((e as Error).message); 
    } finally { 
      setBusy(false); 
    }
  };

  const saveEcoPoint = async (id: string) => {
    const epId = editEcoPoints[id];
    const ep = ecoPoints.find((x) => x.id === epId);
    try {
      await updateProfile(id, { 
        eco_point_id: epId || null,
        area: ep ? ep.area : null 
      });
      toast.success("Eco Ponto associado com sucesso");
      setEditEcoPoints((s) => { const c = { ...s }; delete c[id]; return c; });
      reload();
    } catch (e) { 
      toast.error((e as Error).message); 
    }
  };

  const demote = async (p: Profile) => {
    try {
      await setUserRole(p.id, "citizen");
      await updateProfile(p.id, { eco_point_id: null });
      toast.success(`${p.name || "Operador"} despromovido`);
      reload();
    } catch (e) { 
      toast.error((e as Error).message); 
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Operadores</h1>
            <p className="text-sm text-muted-foreground mt-1">Promover cidadãos a operadores e gerir as suas zonas.</p>
          </div>
          <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) { setFound(null); setSearchPhone("+258"); setSelectedEcoPointId(""); } }}>
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
                      <Label className="text-sm">Eco Ponto Associado</Label>
                      <select
                        value={selectedEcoPointId}
                        onChange={(e) => setSelectedEcoPointId(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione um Eco Ponto...</option>
                        {ecoPoints.map((ep) => (
                          <option key={ep.id} value={ep.id}>
                            {ep.name} ({ep.area})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
                <Button onClick={promote} disabled={!found || !selectedEcoPointId || busy}>{busy ? "A promover…" : "Promover"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading && <div className="text-sm text-muted-foreground mb-6">A carregar…</div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ops.map((o) => {
            const editing = editEcoPoints[o.id] !== undefined;
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
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Eco Ponto Associado</Label>
                    <div className="flex gap-2 mt-1">
                      <select
                        value={editing ? editEcoPoints[o.id] : (o.eco_point_id ?? "")}
                        onChange={(e) => setEditEcoPoints((s) => ({ ...s, [o.id]: e.target.value }))}
                        className="h-9 w-full rounded-xl border border-input bg-background px-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Sem Eco Ponto</option>
                        {ecoPoints.map((ep) => (
                          <option key={ep.id} value={ep.id}>
                            {ep.name} ({ep.area})
                          </option>
                        ))}
                      </select>
                      {editing && editEcoPoints[o.id] !== o.eco_point_id && (
                        <Button size="sm" onClick={() => saveEcoPoint(o.id)} className="h-9">
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
                          {o.name || "Este utilizador"} voltará a ter apenas o papel de cidadão e a sua associação ao Eco Ponto será removida.
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
