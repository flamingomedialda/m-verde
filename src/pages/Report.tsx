import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, MapPin, Check, Droplets, Trash2, Bug, Waves, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createReport, uploadPhoto } from "@/lib/api";

const types = [
  { id: "Cheias", icon: Droplets, color: "text-info bg-info/10" },
  { id: "Lixo Acumulado", icon: Trash2, color: "text-warning bg-warning/10" },
  { id: "Risco de Mosquitos / Doenças", icon: Bug, color: "text-danger bg-danger/10" },
  { id: "Água Parada", icon: Waves, color: "text-info bg-info/10" },
  { id: "Outro", icon: MoreHorizontal, color: "text-muted-foreground bg-muted" },
];

export default function Report() {
  const nav = useNavigate();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [area, setArea] = useState("A detectar localização...");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const next = () => setStep((s) => s + 1);
  const back = () => step > 1 ? setStep(step - 1) : nav("/home");

  const detectLocation = () => {
    if (!("geolocation" in navigator)) { setArea("Maputo · KaMpfumo"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setArea("Localização actual (GPS)"); },
      () => setArea("Maputo · KaMpfumo")
    );
  };

  const submit = async () => {
    if (!user || !type) return;
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) photo_url = await uploadPhoto(photoFile, "reports");
      await createReport({
        citizen_id: user.id,
        type, area, description: null,
        lat: coords?.lat ?? null, lng: coords?.lng ?? null,
        photo_url,
      });
      await refresh();
      setStep(5);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <MobileShell withNav={false}>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={back} className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Passo {Math.min(step, 4)} de 4</div>
          <div className="font-semibold">Reportar problema</div>
        </div>
      </header>
      <div className="px-5 mb-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-green transition-all" style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Qual é o problema?</h2>
          <p className="text-sm text-muted-foreground mb-4">Toque para seleccionar.</p>
          <div className="space-y-2.5">
            {types.map((t) => {
              const Icon = t.icon; const sel = type === t.id;
              return (
                <button key={t.id} onClick={() => setType(t.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left tap-scale border-2 transition-all ${sel ? "border-primary bg-accent shadow-soft" : "border-transparent bg-card shadow-card"}`}>
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${t.color}`}><Icon className="h-6 w-6" /></div>
                  <span className="flex-1 font-semibold">{t.id}</span>
                  {sel && <Check className="h-5 w-5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Adicione uma foto</h2>
          <p className="text-sm text-muted-foreground mb-4">Ajuda os técnicos a actuar mais rápido.</p>
          <label className="block">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              setPhotoFile(f);
              const r = new FileReader(); r.onload = () => setPhotoPreview(r.result as string); r.readAsDataURL(f);
            }} />
            <div className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 ${photoPreview ? "border-primary" : "border-border bg-card"}`}>
              {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover rounded-2xl" /> : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-3"><Camera className="h-8 w-8 text-primary" /></div>
                  <div className="font-semibold">Tirar / escolher foto</div>
                  <div className="text-xs text-muted-foreground mt-1">Toque aqui</div>
                </>
              )}
            </div>
          </label>
          <button onClick={next} className="mt-3 w-full text-sm text-muted-foreground font-medium py-2">Saltar este passo</button>
        </div>
      )}

      {step === 3 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Localização</h2>
          <p className="text-sm text-muted-foreground mb-4">Detectada automaticamente.</p>
          <div className="rounded-3xl overflow-hidden bg-card shadow-card">
            <div className="h-44 relative bg-gradient-to-br from-emerald-100 to-sky-100">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-12 w-12 rounded-full bg-danger ring-8 ring-danger/20 flex items-center justify-center"><MapPin className="h-6 w-6 text-white" /></div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Zona detectada</div>
                <div className="font-semibold">{area}</div>
              </div>
              <button onClick={detectLocation} className="text-sm text-primary font-medium">Detectar</button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="px-5 pb-32">
          <h2 className="text-xl font-bold mb-1">Confirmar envio</h2>
          <p className="text-sm text-muted-foreground mb-4">Reveja os detalhes antes de submeter.</p>
          <div className="bg-card rounded-3xl shadow-card divide-y divide-border">
            <Row label="Tipo" value={type ?? "—"} />
            <Row label="Foto" value={photoFile ? "Anexada" : "Sem foto"} icon={photoFile ? <ImageIcon className="h-4 w-4" /> : undefined} />
            <Row label="Local" value={area} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="px-5 pb-10 pt-10 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full gradient-green flex items-center justify-center shadow-soft mb-5"><Check className="h-12 w-12 text-white" strokeWidth={3} /></div>
          <h2 className="text-2xl font-bold">Reporte enviado com sucesso</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">As autoridades comunitárias foram notificadas.</p>
          <Button onClick={() => nav("/home")} size="lg" className="mt-8 w-full h-14 rounded-2xl text-base font-semibold">Voltar ao início</Button>
        </div>
      )}

      {step < 5 && (
        <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <Button size="lg" disabled={busy || (step === 1 && !type)}
              onClick={() => {
                if (step === 1 && !type) return toast.error("Escolha um tipo");
                if (step === 3) detectLocation();
                if (step === 4) return submit();
                next();
              }}
              className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft">
              {step === 4 ? (busy ? "A enviar…" : "Submeter reporte") : "Continuar"}
            </Button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold flex items-center gap-1.5">{icon}{value}</span>
    </div>
  );
}
