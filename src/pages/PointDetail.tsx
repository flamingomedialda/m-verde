import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MapPin, Check } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { REWARDS } from "@/lib/types";
import { redeemReward } from "@/lib/api";

export default function PointDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user, profile, refresh } = useAuth();
  const [redeemed, setRedeemed] = useState(false);
  const [busy, setBusy] = useState(false);
  const reward = REWARDS.find((r) => r.id === id) ?? null;

  const doRedeem = async () => {
    if (!user || !reward) return;
    if ((profile?.points ?? 0) < reward.points) return toast.error("Pontos insuficientes");
    setBusy(true);
    try {
      await redeemReward(user.id, reward.title, reward.points);
      await refresh();
      setRedeemed(true);
      toast.success("Resgate confirmado");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  if (!reward) return null;

  return (
    <MobileShell withNav={false}>
      <button onClick={() => nav("/points")} className="mx-5 mt-5 flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" /> Recompensas
      </button>
      <div className="px-5 mt-4">
        <div className="rounded-3xl bg-accent h-56 flex items-center justify-center text-8xl shadow-card">{reward.icon}</div>
        <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground mt-5">{reward.category}</div>
        <h1 className="text-2xl font-bold mt-1">{reward.title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{reward.description}</p>

        <div className="mt-5 bg-card rounded-3xl p-4 shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Pontos necessários</div>
            <div className="text-2xl font-extrabold text-primary">{reward.points} pts</div>
          </div>
          <div className="h-12 w-12 rounded-2xl gradient-green flex items-center justify-center text-white"><Check className="h-6 w-6" /></div>
        </div>

        <div className="mt-5 bg-card rounded-3xl p-4 shadow-card">
          <h3 className="font-semibold mb-2">Como resgatar</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Dirija-se ao Eco Ponto mais próximo.</li>
            <li>2. Apresente o seu número de telemóvel ao operador.</li>
            <li>3. Receba a sua recompensa.</li>
          </ol>
          <div className="mt-3 flex items-center gap-2 text-xs text-info"><MapPin className="h-4 w-4" /> Disponível em todos os Eco Pontos activos</div>
        </div>

        <div className="pb-10 pt-6">
          <Button onClick={doRedeem} disabled={redeemed || busy} size="lg" className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft">
            {redeemed ? "Resgate confirmado" : busy ? "A processar…" : "Resgatar no Eco Ponto"}
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
