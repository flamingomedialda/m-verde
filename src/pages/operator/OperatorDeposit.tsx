import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, Check, Minus, Plus, User as UserIcon, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { createDeposit } from "@/lib/api";
import {
  pointsForMaterial, formatWeight, MATERIAL_POINTS_PER_100G, type Profile,
} from "@/lib/types";

const MATERIALS = ["Plástico", "Vidro", "Papel", "Metal"];
const ICONS: Record<string, string> = {
  "Plástico": "🥤", "Vidro": "🍶", "Papel": "📄", "Metal": "🥫",
};

export default function OperatorDeposit() {
  const nav = useNavigate();
  const { user: op } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("+258");
  const [citizen, setCitizen] = useState<Profile | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  // Peso por material (gramas)
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setBusy(true);
    const { data, error } = await supabase.from("profiles").select("*").eq("phone", phone.trim()).maybeSingle();
    setBusy(false);
    if (error || !data) return toast.error("Cidadão não encontrado");
    setCitizen(data as Profile);
    setStep(2);
  };

  const toggleMaterial = (m: string) =>
    setMaterials((s) => {
      const has = s.includes(m);
      if (has) {
        setWeights((w) => { const c = { ...w }; delete c[m]; return c; });
        return s.filter((x) => x !== m);
      }
      setWeights((w) => ({ ...w, [m]: 0 }));
      return [...s, m];
    });

  const bump = (m: string, delta: number) =>
    setWeights((w) => ({ ...w, [m]: Math.max(0, (w[m] ?? 0) + delta) }));

  const totalWeight = materials.reduce((a, m) => a + (weights[m] ?? 0), 0);
  const totalPoints = materials.reduce((a, m) => a + pointsForMaterial(m, weights[m] ?? 0), 0);
  const allWeightsSet = materials.length > 0 && materials.every((m) => (weights[m] ?? 0) > 0);

  const confirm = async () => {
    if (!citizen || !op) return;
    setBusy(true);
    try {
      await createDeposit({
        citizen_id: citizen.id, operator_id: op.id,
        materials, weight_g: totalWeight, points: totalPoints,
      });
      setDone(true);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const back = () => step > 1 && !done ? setStep(step - 1) : nav("/operator");

  if (done && citizen) {
    return (
      <MobileShell withNav={false}>
        <div className="px-5 pt-16 pb-10 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full gradient-green flex items-center justify-center shadow-soft mb-5">
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold">Depósito registado</h2>
          <p className="text-sm text-muted-foreground mt-2">Guardado com sucesso na base de dados</p>
          <div className="w-full mt-6 bg-card rounded-3xl p-4 shadow-card text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <MessageSquare className="h-3.5 w-3.5" /> Confirmação
            </div>
            <pre className="mt-2 text-xs whitespace-pre-wrap text-foreground/90 font-sans bg-muted rounded-2xl p-3">
{`KUBASILE:
Depósito registado.

Peso total: ${formatWeight(totalWeight)}
Pontos ganhos: +${totalPoints}
Saldo actual: ${citizen.points + totalPoints} pontos`}
            </pre>
          </div>
          <Button onClick={() => nav("/operator")} size="lg" className="mt-6 w-full h-14 rounded-2xl">Voltar</Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell withNav={false}>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={back} className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Passo {step} de 5</div>
          <div className="font-semibold">Novo depósito</div>
        </div>
      </header>
      <div className="px-5 mb-4"><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full gradient-green transition-all" style={{ width: `${(step / 5) * 100}%` }} /></div></div>

      {step === 1 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Encontrar cidadão</h2>
          <p className="text-sm text-muted-foreground mb-4">Insira o número de telemóvel.</p>
          <div className="bg-card rounded-3xl p-4 shadow-card">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-lg font-semibold py-3 px-4 rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+258 ..." />
            <Button onClick={search} disabled={busy} size="lg" className="w-full mt-3 h-14 rounded-2xl">
              <Search className="h-5 w-5" /> {busy ? "A procurar…" : "Procurar cidadão"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && citizen && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Confirmar cidadão</h2>
          <div className="mt-3 bg-card rounded-3xl p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl gradient-green text-white flex items-center justify-center text-xl font-bold">{citizen.name.charAt(0)}</div>
              <div>
                <div className="font-bold text-lg">{citizen.name}</div>
                <div className="text-sm text-muted-foreground">{citizen.phone}</div>
              </div>
            </div>
            <div className="mt-4 bg-accent rounded-2xl p-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Saldo actual</div>
              <div className="font-bold text-primary">{citizen.points} pts</div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Materiais</h2>
          <p className="text-sm text-muted-foreground mb-4">Seleccione um ou mais tipos.</p>
          <div className="grid grid-cols-2 gap-3">
            {MATERIALS.map((m) => {
              const sel = materials.includes(m);
              return (
                <button key={m} onClick={() => toggleMaterial(m)} className={`p-5 rounded-3xl text-left border-2 transition-all tap-scale ${sel ? "border-primary bg-accent shadow-soft" : "border-transparent bg-card shadow-card"}`}>
                  <div className="text-2xl mb-2">{ICONS[m]}</div>
                  <div className="font-semibold">{m}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{MATERIAL_POINTS_PER_100G[m]} pt / 100 g</div>
                  {sel && <Check className="h-4 w-4 text-primary mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Peso por material</h2>
          <p className="text-sm text-muted-foreground mb-4">Indique o peso (gramas) de cada material.</p>
          <div className="space-y-3">
            {materials.map((m) => {
              const w = weights[m] ?? 0;
              const pts = pointsForMaterial(m, w);
              return (
                <div key={m} className="bg-card rounded-3xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ICONS[m]}</span>
                      <div>
                        <div className="font-semibold">{m}</div>
                        <div className="text-[11px] text-muted-foreground">{MATERIAL_POINTS_PER_100G[m]} pt / 100 g</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Pontos</div>
                      <div className="font-bold text-primary">+{pts}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => bump(m, -100)} className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center tap-scale"><Minus className="h-5 w-5" /></button>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold">{w}</div>
                      <div className="text-[11px] text-muted-foreground">g ({formatWeight(w)})</div>
                    </div>
                    <button onClick={() => bump(m, 100)} className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center tap-scale"><Plus className="h-5 w-5" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[100, 500, 1000, 5000].map((v) => (
                      <button key={v} onClick={() => bump(m, v)} className="py-2 rounded-xl bg-accent text-primary font-bold tap-scale text-xs">
                        +{v >= 1000 ? `${v/1000}kg` : `${v}g`}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 bg-accent rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-bold">{formatWeight(totalWeight)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Pontos totais</div>
              <div className="font-extrabold text-primary text-lg">+{totalPoints}</div>
            </div>
          </div>
        </div>
      )}

      {step === 5 && citizen && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Confirmar depósito</h2>
          <div className="bg-card rounded-3xl shadow-card divide-y divide-border mt-3">
            <Row label="Cidadão" value={citizen.name} icon={<UserIcon className="h-4 w-4" />} />
            {materials.map((m) => (
              <Row key={m} label={m} value={`${weights[m] ?? 0} g · +${pointsForMaterial(m, weights[m] ?? 0)} pts`} />
            ))}
            <Row label="Peso total" value={`${totalWeight} g (${formatWeight(totalWeight)})`} />
            <Row label="Pontos totais" value={`+${totalPoints} pts`} />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          <Button size="lg"
            disabled={busy
              || (step === 3 && materials.length === 0)
              || (step === 4 && !allWeightsSet)}
            onClick={() => {
              if (step === 1) return search();
              if (step === 5) return confirm();
              setStep(step + 1);
            }}
            className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft">
            {step === 5 ? (busy ? "A guardar…" : "Confirmar depósito") : step === 1 ? "Procurar" : "Continuar"}
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
