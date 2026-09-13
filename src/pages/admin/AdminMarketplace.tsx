import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Package, Ticket, Boxes, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  listProducts, createProduct, updateProduct, deleteProduct,
  listCodesForProduct, addCodes, deleteCode, countAvailableCodes,
  listStockForProduct, upsertStock, listEcoPoints, uploadPhoto,
} from "@/lib/api";
import type { EcoPoint, Product, ProductCategory, ProductStock, RechargeCode } from "@/lib/types";
import { PRODUCT_CATEGORY_LABEL } from "@/lib/types";

const CATS: ProductCategory[] = ["recharge", "food", "stationery", "other"];

export default function AdminMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ecoPoints, setEcoPoints] = useState<EcoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [p, e] = await Promise.all([listProducts(false), listEcoPoints()]);
      setProducts(p); setEcoPoints(e);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-sm text-muted-foreground mt-1">Produtos disponíveis para troca por pontos.</p>
          </div>
          <ProductForm open={addOpen} setOpen={setAddOpen} onSaved={reload} />
        </div>

        {loading && <div className="text-sm text-muted-foreground mb-6">A carregar…</div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="text-left bg-card rounded-3xl p-5 shadow-card hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-accent text-primary flex items-center justify-center overflow-hidden shrink-0">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    : <Package className="h-6 w-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold truncate">{p.name}</div>
                    {!p.active && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{PRODUCT_CATEGORY_LABEL[p.category]} · {p.points_cost} pts</div>
                </div>
              </div>
              {p.description && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{p.description}</p>}
            </button>
          ))}
          {!loading && products.length === 0 && <div className="text-sm text-muted-foreground">Ainda sem produtos.</div>}
        </div>

        {selected && (
          <ProductDetail product={selected} ecoPoints={ecoPoints}
            onClose={() => setSelected(null)}
            onChanged={() => { reload(); setSelected(null); }} />
        )}
      </div>
    </AdminLayout>
  );
}

// ================== FORM CRIAR/EDITAR ==================

function ProductForm({ open, setOpen, onSaved, initial }:
  { open: boolean; setOpen: (v: boolean) => void; onSaved: () => void; initial?: Product }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "recharge");
  const [cost, setCost] = useState<number>(initial?.points_cost ?? 50);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && !initial) {
      setName(""); setCategory("recharge"); setCost(50); setDescription(""); setActive(true); setImageUrl(null);
    }
  }, [open, initial]);

  const pickImage = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Escolha um ficheiro de imagem");
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem demasiado grande (máx. 5 MB)");
    setUploading(true);
    try { setImageUrl(await uploadPhoto(file, "products")); toast.success("Foto carregada"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Nome obrigatório");
    if (cost <= 0) return toast.error("Custo em pontos inválido");
    setBusy(true);
    try {
      if (initial) {
        await updateProduct(initial.id, { name: name.trim(), category, points_cost: cost, description: description.trim() || null, image_url: imageUrl, active });
        toast.success("Produto actualizado");
      } else {
        await createProduct({ name: name.trim(), category, points_cost: cost, description: description.trim() || null, image_url: imageUrl, active });
        toast.success("Produto criado");
      }
      setOpen(false); onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!initial && (
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-2xl"><Plus className="h-4 w-4" /> Novo produto</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{initial ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Recarga Vodacom 10 MT" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="mt-1 w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                {CATS.map((c) => <option key={c} value={c}>{PRODUCT_CATEGORY_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <Label>Custo (pontos)</Label>
              <Input type="number" min={1} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes visíveis ao cidadão" />
          </div>
          <div>
            <Label>Foto do produto</Label>
            <div className="mt-1 flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {imageUrl
                  ? <img src={imageUrl} alt={name || "Produto"} className="h-full w-full object-cover" />
                  : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} disabled={uploading} />
                {uploading && <div className="text-xs text-muted-foreground mt-1">A carregar foto…</div>}
                {imageUrl && !uploading && (
                  <button type="button" className="text-xs text-danger mt-1" onClick={() => setImageUrl(null)}>Remover foto</button>
                )}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activo (visível na loja)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save} disabled={busy}>{busy ? "A guardar…" : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ================== DETALHE (códigos ou stock por eco-ponto) ==================

function ProductDetail({ product, ecoPoints, onClose, onChanged }:
  { product: Product; ecoPoints: EcoPoint[]; onClose: () => void; onChanged: () => void }) {
  const [codes, setCodes] = useState<RechargeCode[]>([]);
  const [stock, setStock] = useState<ProductStock[]>([]);
  const [available, setAvailable] = useState(0);
  const [pasted, setPasted] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    if (product.category === "recharge") {
      const [c, a] = await Promise.all([listCodesForProduct(product.id), countAvailableCodes(product.id)]);
      setCodes(c); setAvailable(a);
    } else {
      const s = await listStockForProduct(product.id);
      setStock(s);
    }
  };
  useEffect(() => { void reload(); /* eslint-disable-next-line */ }, [product.id]);

  const submitCodes = async () => {
    const list = pasted.split(/[\s,;\n]+/).map((c) => c.trim()).filter(Boolean);
    if (!list.length) return toast.error("Cole pelo menos um código");
    setBusy(true);
    try { await addCodes(product.id, list); toast.success(`${list.length} código(s) adicionado(s)`); setPasted(""); reload(); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const stockByEp = useMemo(() => {
    const m = new Map<string, number>();
    stock.forEach((s) => m.set(s.eco_point_id, s.quantity));
    return m;
  }, [stock]);

  const removeProduct = async () => {
    if (!confirm(`Eliminar "${product.name}"? Esta acção não pode ser desfeita.`)) return;
    try { await deleteProduct(product.id); toast.success("Produto eliminado"); onChanged(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.category === "recharge" ? <Ticket className="h-5 w-5" /> : <Boxes className="h-5 w-5" />}
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground -mt-2 mb-2">
          {PRODUCT_CATEGORY_LABEL[product.category]} · {product.points_cost} pts · {product.active ? "Activo" : "Inactivo"}
        </div>

        {product.category === "recharge" ? (
          <div className="space-y-4">
            <div className="bg-accent rounded-2xl p-4 flex items-center justify-between">
              <div><div className="text-xs text-muted-foreground">Códigos disponíveis</div><div className="text-2xl font-bold">{available}</div></div>
              <div className="text-right"><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-bold">{codes.length}</div></div>
            </div>
            <div>
              <Label>Adicionar códigos (um por linha)</Label>
              <Textarea value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="ABC123&#10;DEF456&#10;GHI789" rows={4} />
              <Button className="mt-2" onClick={submitCodes} disabled={busy}>{busy ? "A guardar…" : "Adicionar códigos"}</Button>
            </div>
            <div className="max-h-56 overflow-auto border rounded-xl">
              {codes.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 border-b last:border-0 text-sm">
                  <span className="font-mono">{c.code}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={c.status === "used" ? "bg-muted" : "bg-success/10 text-success"}>
                      {c.status === "used" ? "Usado" : c.status === "reserved" ? "Reservado" : "Disponível"}
                    </Badge>
                    {c.status === "available" && (
                      <button onClick={async () => { await deleteCode(c.id); reload(); }} className="text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {codes.length === 0 && <div className="text-xs text-muted-foreground text-center py-6">Ainda sem códigos.</div>}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Quantidade alocada por Eco Ponto:</div>
            <div className="space-y-2 max-h-72 overflow-auto">
              {ecoPoints.map((ep) => {
                const q = stockByEp.get(ep.id) ?? 0;
                return (
                  <StockRow key={ep.id} ep={ep} quantity={q} productId={product.id} onSaved={reload} />
                );
              })}
              {ecoPoints.length === 0 && <div className="text-xs text-muted-foreground">Sem Eco Pontos criados.</div>}
            </div>
          </div>
        )}

        <DialogFooter className="!justify-between">
          <Button variant="destructive" onClick={removeProduct}><Trash2 className="h-4 w-4" /> Eliminar</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button onClick={() => setEditOpen(true)}>Editar</Button>
          </div>
        </DialogFooter>

        {editOpen && <ProductForm open={editOpen} setOpen={setEditOpen} onSaved={onChanged} initial={product} />}
      </DialogContent>
    </Dialog>
  );
}

function StockRow({ ep, quantity, productId, onSaved }:
  { ep: EcoPoint; quantity: number; productId: string; onSaved: () => void }) {
  const [q, setQ] = useState<number>(quantity);
  const [busy, setBusy] = useState(false);
  const dirty = q !== quantity;
  const save = async () => {
    setBusy(true);
    try { await upsertStock(productId, ep.id, Math.max(0, q)); toast.success(`Stock actualizado (${ep.name})`); onSaved(); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-3 p-3 border rounded-xl">
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{ep.name}</div>
        <div className="text-xs text-muted-foreground">{ep.area}</div>
      </div>
      <Input type="number" min={0} value={q} onChange={(e) => setQ(Number(e.target.value))} className="w-24" />
      <Button size="sm" onClick={save} disabled={!dirty || busy}>Guardar</Button>
    </div>
  );
}
