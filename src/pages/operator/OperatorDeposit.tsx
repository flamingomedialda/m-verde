import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, Check, Minus, Plus, User as UserIcon, MessageSquare } from "lucide-react";
import { store, getCurrentUser, pointsForGrams, formatWeight, type User } from "@/lib/mockData";
import { toast } from "sonner";

const MATERIALS = ["Plástico", "Vidro", "Papel", "Metal"];

export default function OperatorDeposit() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("+258");
  const [citizen, setCitizen] = useState<User | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  const [weightG, setWeightG] = useState(0);
  const [done, setDone] = useState(false);

  const search = () => {
    const u = store.get().users.find((x) => x.phone === phone && x.role === "citizen");
    if (!u) return toast.error("Cidadão não encontrado");
    setCitizen(u);
    setStep(2);
  };

  const toggleMaterial = (m: string) => setMaterials((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);

  const confirm = () => {
    if (!citizen) return;
    const op = getCurrentUser();
    const pts = pointsForGrams(weightG);
    store.update((s) => {
      s.deposits.unshift({
        id: "d" + Date.now(),
        citizenId: citizen.id,
        citizenName: citizen.name,
        operatorId: op?.id ?? "",
        materials,
        weightG,
        points: pts,
        date: new Date().toISOString(),
      });
      const u = s.users.find((x) => x.id === citizen.id);
      if (u) { u.points += pts; u.totalG += weightG; }
    });
    setDone(true);
  };

  const back = () => step > 1 && !done ? setStep(step - 1) : nav("/operator");
  const estPoints = pointsForGrams(weightG);

  if (done) {
    return (
      <MobileShell withNav={false}>
        <div className="px-5 pt-16 pb-10 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full gradient-green flex items-center justify-center shadow-soft mb-5">
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold">Depósito registado</h2>
          <p className="text-sm text-muted-foreground mt-2">SMS enviado com sucesso</p>

          <div className="w-full mt-6 bg-card rounded-3xl p-4 shadow-card text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <MessageSquare className="h-3.5 w-3.5" /> SMS enviado
            </div>
            <pre className="mt-2 text-xs whitespace-pre-wrap text-foreground/90 font-sans bg-muted rounded-2xl p-3">
{`KUBASILE:
O seu depósito foi registado com sucesso.

Peso: ${formatWeight(weightG)}
Saldo actual: ${(citizen?.points ?? 0) + estPoints} pontos

Use os seus pontos em material escolar, recargas e benefícios comunitários.`}
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
        <button onClick={back} className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Passo {step} de 5</div>
          <div className="font-semibold">Novo depósito</div>
        </div>
      </header>
      <div className="px-5 mb-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-green transition-all" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Encontrar cidadão</h2>
          <p className="text-sm text-muted-foreground mb-4">Insira o número de telemóvel.</p>
          <div className="bg-card rounded-3xl p-4 shadow-card">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-lg font-semibold py-3 px-4 rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+258 ..." />
            <Button onClick={search} size="lg" className="w-full mt-3 h-14 rounded-2xl">
              <Search className="h-5 w-5" /> Procurar cidadão
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">Demo: +258841234567 ou +258842345678</p>
          </div>
        </div>
      )}

      {step === 2 && citizen && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Confirmar cidadão</h2>
          <div className="mt-3 bg-card rounded-3xl p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl gradient-green text-white flex items-center justify-center text-xl font-bold">
                {citizen.name.charAt(0)}
              </div>
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
          <p className="text-sm text-muted-foreground mb-4">Seleccione um ou mais.</p>
          <div className="grid grid-cols-2 gap-3">
            {MATERIALS.map((m) => {
              const sel = materials.includes(m);
              return (
                <button key={m} onClick={() => toggleMaterial(m)} className={`p-5 rounded-3xl text-left border-2 transition-all tap-scale ${
                  sel ? "border-primary bg-accent shadow-soft" : "border-transparent bg-card shadow-card"
                }`}>
                  <div className="text-2xl mb-2">{m === "Plástico" ? "🥤" : m === "Vidro" ? "🍶" : m === "Papel" ? "📄" : "🥫"}</div>
                  <div className="font-semibold">{m}</div>
                  {sel && <Check className="h-4 w-4 text-primary mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Peso</h2>
          <p className="text-sm text-muted-foreground mb-4">Indique o peso em gramas.</p>
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <button onClick={() => setWeightG(Math.max(0, weightG - 100))} className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center tap-scale">
                <Minus className="h-6 w-6" />
              </button>
              <div className="text-center">
                <div className="text-5xl font-extrabold">{weightG}</div>
                <div className="text-xs text-muted-foreground mt-1">gramas ({formatWeight(weightG)})</div>
              </div>
              <button onClick={() => setWeightG(weightG + 100)} className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center tap-scale">
                <Plus className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[100, 500, 1000, 5000].map((v) => (
                <button key={v} onClick={() => setWeightG(weightG + v)} className="py-3 rounded-2xl bg-accent text-primary font-bold tap-scale text-sm">
                  +{v >= 1000 ? `${v/1000}kg` : `${v}g`}
                </button>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Equivalente a <b className="text-primary">{estPoints} pontos</b>
            </div>
          </div>
        </div>
      )}

      {step === 5 && citizen && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Confirmar depósito</h2>
          <div className="bg-card rounded-3xl shadow-card divide-y divide-border mt-3">
            <Row label="Cidadão" value={citizen.name} icon={<UserIcon className="h-4 w-4" />} />
            <Row label="Materiais" value={materials.join(", ") || "—"} />
            <Row label="Peso" value={`${weightG} g (${formatWeight(weightG)})`} />
            <Row label="Pontos estimados" value={`+${estPoints} pts`} />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            disabled={(step === 3 && materials.length === 0) || (step === 4 && weightG === 0)}
            onClick={() => {
              if (step === 1) return search();
              if (step === 5) return confirm();
              setStep(step + 1);
            }}
            className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft"
          >
            {step === 5 ? "Confirmar depósito" : step === 1 ? "Procurar" : "Continuar"}
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
