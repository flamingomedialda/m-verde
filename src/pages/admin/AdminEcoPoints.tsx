import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OLMap } from "@/components/OLMap";
import { toast } from "sonner";
import { createEcoPoint, deleteEcoPoint, listEcoPoints, updateEcoPoint } from "@/lib/api";
import type { EcoPoint } from "@/lib/types";

type Draft = Omit<EcoPoint, "id" | "created_at" | "distanceKm"> & { id?: string };

function empty(): Draft {
  return { name: "", area: "", address: null, lat: -25.9692, lng: 32.5732, materials: [], active: true, operator_id: null };
}

export default function AdminEcoPoints() {
  const [items, setItems] = useState<EcoPoint[]>([]);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<EcoPoint | null>(null);
  const refresh = () => listEcoPoints().then(setItems).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.area.trim()) return toast.error("Preencha nome e zona");
    try {
      if (editing.id) {
        const { id, ...rest } = editing;
        await updateEcoPoint(id, rest);
      } else {
        await createEcoPoint(editing);
      }
      await refresh(); setEditing(null); toast.success("Eco Ponto guardado");
    } catch (e) { toast.error((e as Error).message); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try { await deleteEcoPoint(deleting.id); await refresh(); setDeleting(null); toast.success("Eco Ponto removido"); }
    catch (e) { toast.error((e as Error).message); }
  };

  const toggle = async (e: EcoPoint) => {
    try { await updateEcoPoint(e.id, { active: !e.active }); await refresh(); }
    catch (err) { toast.error((err as Error).message); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-3xl font-bold">Eco Pontos</h1><p className="text-sm text-muted-foreground mt-1">Gerir locais de recolha em Moçambique</p></div>
          <Button onClick={() => setEditing(empty())} className="rounded-xl h-11"><Plus className="h-4 w-4" /> Criar Eco Ponto</Button>
        </div>

        <div className="bg-card rounded-3xl shadow-card overflow-hidden mb-4">
          <OLMap markers={items.map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, color: e.active ? "#16a34a" : "#94a3b8" }))} height={320} showMyLocation />
        </div>

        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Nome</th><th className="px-5 py-3 font-semibold">Zona</th>
              <th className="px-5 py-3 font-semibold">Coordenadas</th><th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold text-right">Acções</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {items.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent text-primary flex items-center justify-center"><MapPin className="h-5 w-5" /></div><span className="font-semibold">{e.name}</span></div></td>
                  <td className="px-5 py-4 text-muted-foreground">{e.area}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{e.lat.toFixed(4)}, {e.lng.toFixed(4)}</td>
                  <td className="px-5 py-4"><button onClick={() => toggle(e)}><Badge className={e.active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>{e.active ? "Activo" : "Inactivo"}</Badge></button></td>
                  <td className="px-5 py-4 text-right"><div className="inline-flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ ...e })}><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                    <Button size="sm" variant="outline" className="text-danger" onClick={() => setDeleting(e)}><Trash2 className="h-3.5 w-3.5" /> Apagar</Button>
                  </div></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Ainda sem Eco Pontos.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Eco Ponto" : "Criar Eco Ponto"}</DialogTitle><DialogDescription>Clique no mapa para definir a localização.</DialogDescription></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Zona / Bairro</Label><Input value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })} placeholder="Ex: KaMpfumo, Maputo" /></div>
                <div><Label>Latitude</Label><Input type="number" step="0.0001" value={editing.lat} onChange={(e) => setEditing({ ...editing, lat: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Longitude</Label><Input type="number" step="0.0001" value={editing.lng} onChange={(e) => setEditing({ ...editing, lng: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><span className="text-sm">Activo</span></div>
              <div className="rounded-2xl overflow-hidden border">
                <OLMap height={260} center={[editing.lng, editing.lat]} pickedMarker={{ lat: editing.lat, lng: editing.lng }} showMyLocation onPick={(lat, lng) => setEditing({ ...editing, lat, lng })} />
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apagar Eco Ponto?</DialogTitle><DialogDescription>Esta acção não pode ser desfeita. <b>{deleting?.name}</b> será removido.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Apagar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
