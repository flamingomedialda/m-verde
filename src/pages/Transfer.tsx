import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { enviarSms, lookupProfileByPhone, transferPoints, type TransferLookup } from "@/lib/api";

type Step = "form" | "confirm" | "done";

export default function Transfer() {
  const { profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [target, setTarget] = useState<TransferLookup | null>(null);
  const [busy, setBusy] = useState(false);

  const balance = profile?.points ?? 0;

  const check = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) return toast.error("Introduza um número válido (9 dígitos)");
    if (!amount || amount <= 0) return toast.error("Introduza o valor de pontos a transferir");
    if (amount > balance) return toast.error("Pontos insuficientes");
    if (profile?.phone && profile.phone.replace(/\D/g, "").slice(-9) === digits.slice(-9)) {
      return toast.error("Não pode transferir para si mesmo");
    }
    setBusy(true);
    try {
      const found = await lookupProfileByPhone(phone);
      if (!found) return toast.error("Nenhum utilizador encontrado com este número");
      setTarget(found);
      setStep("confirm");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await transferPoints(phone, amount);
      const from = res.sender_phone ?? profile?.phone ?? "";
      const to = res.receiver_phone ?? phone;
      enviarSms(from, `M-verde: Transferiu ${res.amount} pontos para o numero ${to}. Saldo actual: ${res.sender_balance} pontos.`).catch(() => {});
      enviarSms(to, `M-verde: Recebeu ${res.amount} pontos do numero ${from}.`).catch(() => {});
      await refresh();
      setStep("done");
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("insufficient_points")) toast.error("Pontos insuficientes");
      else if (msg.includes("receiver_not_found")) toast.error("Destinatário não encontrado");
      else if (msg.includes("self_transfer")) toast.error("Não pode transferir para si mesmo");
      else toast.error(msg);
    } finally { setBusy(false); }
  };

  return (
    <MobileShell>
      <PageHeader title="Transferir pontos" subtitle="Envie pontos para outro cidadão" />

      <section className="px-5">
        <div className="rounded-3xl p-5 gradient-green text-white shadow-soft">
          <div className="text-xs text-white/80">Saldo actual</div>
          <div className="text-4xl font-extrabold">{balance} <span className="text-base font-semibold">pontos</span></div>
        </div>
      </section>

      {step === "form" && (
        <section className="px-5 mt-5 space-y-4">
          <div>
            <Label>Número do destinatário</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Ex.: 84 123 4567" />
          </div>
          <div>
            <Label>Pontos a transferir</Label>
            <Input type="number" min={1} max={balance} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0" />
          </div>
          <Button className="w-full h-12 rounded-2xl" onClick={check} disabled={busy}>
            {busy ? "A verificar…" : <>Confirmar <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </section>
      )}

      {step === "confirm" && target && (
        <section className="px-5 mt-5 space-y-4">
          <div className="bg-card rounded-3xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-accent text-primary flex items-center justify-center"><User className="h-6 w-6" /></div>
              <div>
                <div className="text-xs text-muted-foreground">Destinatário</div>
                <div className="font-bold">{target.name}</div>
                <div className="text-xs text-muted-foreground">{target.phone}</div>
              </div>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pontos a enviar</span>
              <span className="text-xl font-bold text-primary">{amount} pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo após envio</span>
              <span className="font-semibold">{balance - amount} pts</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setStep("form")} disabled={busy}>Voltar</Button>
            <Button className="flex-1 h-12 rounded-2xl" onClick={confirm} disabled={busy}>
              {busy ? "A enviar…" : <><Send className="h-4 w-4" /> Confirmar envio</>}
            </Button>
          </div>
        </section>
      )}

      {step === "done" && target && (
        <section className="px-5 mt-5">
          <div className="bg-card rounded-3xl p-6 shadow-card text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <div className="font-bold text-lg">Transferência concluída</div>
            <p className="text-sm text-muted-foreground">
              Enviou <strong>{amount} pontos</strong> para {target.name} ({target.phone}).
            </p>
            <p className="text-xs text-muted-foreground">Ambos receberão uma SMS de confirmação.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => { setStep("form"); setPhone(""); setAmount(0); setTarget(null); }}>Nova transferência</Button>
              <Button className="flex-1 rounded-2xl" onClick={() => navigate("/home")}>Início</Button>
            </div>
          </div>
        </section>
      )}

      <BottomNav />
    </MobileShell>
  );
}
