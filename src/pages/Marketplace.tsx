import { useEffect, useMemo, useState } from "react";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Ticket, CheckCircle2, MapPin, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  listProducts, listStockForProduct, redeemProduct, listEcoPoints,
} from "@/lib/api";
import { PRODUCT_CATEGORY_LABEL, type EcoPoint, type Product, type ProductCategory } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CATS: (ProductCategory | "all")[] = ["all", "recharge", "food", "stationery", "other"];

export default function Marketplace() {
  const { profile, refresh } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [ecoPoints, setEcoPoints] = useState<EcoPoint[]>([]);
  const [tab, setTab] = useState<ProductCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [resultCode, setResultCode] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try { const [p, e] = await Promise.all([listProducts(true), listEcoPoints()]); setProducts(p); setEcoPoints(e); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => products.filter((p) => tab === "all" || p.category === tab), [products, tab]);
  const balance = profile?.points ?? 0;

  return (
    <MobileShell>
      <PageHeader title="Loja de Pontos" subtitle={`Saldo: ${balance} pts`} />

      <div className="px-5 flex gap-2 overflow-x-auto pb-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setTab(c)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold ${tab === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {c === "all" ? "Todos" : PRODUCT_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="px-5 mt-3 grid grid-cols-2 gap-3 pb-6">
        {loading && <div className="col-span-2 text-sm text-muted-foreground text-center py-6">A carregar…</div>}
        {filtered.map((p) => {
          const affordable = balance >= p.points_cost;
          return (
            <button key={p.id} disabled={!affordable} onClick={() => setSelected(p)}
              className={`text-left bg-card rounded-3xl p-4 shadow-card tap-scale ${!affordable ? "opacity-60" : ""}`}>
              <div className="h-10 w-10 rounded-xl bg-accent text-primary flex items-center justify-center mb-2">
                {p.category === "recharge" ? <Ticket className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              </div>
              <div className="font-semibold text-sm leading-tight">{p.name}</div>
              <div className="text-[10px] text-muted-foreground">{PRODUCT_CATEGORY_LABEL[p.category]}</div>
              <div className="mt-2 font-bold text-primary">{p.points_cost} pts</div>
            </button>
          );
        })}
        {!loading && filtered.length === 0 && <div className="col-span-2 text-sm text-muted-foreground text-center py-6">Nada disponível nesta categoria.</div>}
      </div>

      {selected && (
        <RedeemDialog
          product={selected}
          ecoPoints={ecoPoints}
          balance={balance}
          onClose={() => setSelected(null)}
          onRedeemed={async (code) => { setResultCode(code); setSelected(null); await refresh(); reload(); }}
        />
      )}

      {resultCode !== null && (
        <Dialog open onOpenChange={(v) => !v && setResultCode(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="flex items-center gap-2 text-success"><CheckCircle2 className="h-5 w-5" /> Troca concluída!</DialogTitle></DialogHeader>
            {resultCode ? (
              <div className="text-sm">
                <p>O seu código de recarga:</p>
                <div className="mt-3 bg-accent rounded-2xl p-4 font-mono text-xl text-center flex items-center justify-center gap-2">
                  {resultCode}
                  <button onClick={() => { navigator.clipboard.writeText(resultCode); toast.success("Copiado"); }}>
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Guarde este código — ele já não pode ser reutilizado.</p>
              </div>
            ) : (
              <div className="text-sm">Levante o seu prémio no Eco Ponto escolhido.</div>
            )}
            <DialogFooter><Button onClick={() => setResultCode(null)}>Fechar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <BottomNav />
    </MobileShell>
  );
}

function RedeemDialog({ product, ecoPoints, balance, onClose, onRedeemed }:
  { product: Product; ecoPoints: EcoPoint[]; balance: number; onClose: () => void; onRedeemed: (code: string | null) => void }) {
  const [ep, setEp] = useState("");
  const [busy, setBusy] = useState(false);
  const isPhysical = product.category !== "recharge";
  const affordable = balance >= product.points_cost;

  const submit = async () => {
    if (isPhysical && !ep) return toast.error("Escolha um Eco Ponto para levantar");
    setBusy(true);
    try {
      const res = await redeemProduct(product.id, isPhysical ? ep : null);
      onRedeemed(res?.code ?? null);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("insufficient_points")) toast.error("Pontos insuficientes");
      else if (msg.includes("out_of_stock")) toast.error("Sem stock disponível");
      else toast.error(msg);
    } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{product.name}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          {product.description && <p className="text-muted-foreground">{product.description}</p>}
          <div className="bg-accent rounded-2xl p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Custo</span>
            <span className="font-bold text-primary">{product.points_cost} pts</span>
          </div>
          {isPhysical && (
            <div>
              <label className="text-xs text-muted-foreground">Levantar em:</label>
              <select value={ep} onChange={(e) => setEp(e.target.value)} className="mt-1 w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Escolher Eco Ponto…</option>
                {ecoPoints.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.area}</option>)}
              </select>
              <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Apresente o QR ou telemóvel no local.</div>
            </div>
          )}
          {!affordable && <div className="text-danger text-xs">Sem pontos suficientes.</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={busy || !affordable}>{busy ? "A trocar…" : "Confirmar troca"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
