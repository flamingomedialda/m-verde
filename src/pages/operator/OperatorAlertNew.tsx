import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Check, Camera, Droplets, Trash2, HeartPulse, AlertTriangle } from "lucide-react";
import { store, getCurrentUser } from "@/lib/mockData";
import { OLMap } from "@/components/OLMap";

const TYPES = [
  { id: "flooding" as const, label: "Cheias", icon: Droplets, sev: "critical" as const },
  { id: "trash" as const, label: "Acumulação de lixo", icon: Trash2, sev: "medium" as const },
  { id: "health" as const, label: "Risco para a saúde", icon: HeartPulse, sev: "critical" as const },
  { id: "drainage" as const, label: "Drenagem bloqueada", icon: AlertTriangle, sev: "medium" as const },
];

export default function OperatorAlertNew() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<typeof TYPES[number] | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [area, setArea] = useState("A detectar...");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [done, setDone] = useState(false);

  const detect = () => {
    if (!("geolocation" in navigator)) { setArea("Maputo · KaMpfumo"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setArea("Localização actual (GPS)"); },
      () => setArea("Maputo · KaMpfumo"),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const publish = () => {
    if (!type) return;
    const op = getCurrentUser();
    store.update((s) => {
      s.alerts.unshift({
        id: "a" + Date.now(),
        type: type.id,
        severity: type.sev,
        title: type.label,
        description: `Alerta criado pelo operador na zona de ${area}.`,
        area,
        date: new Date().toISOString(),
        operatorId: op?.id,
        lat: coords?.lat,
        lng: coords?.lng,
      });
    });
    setDone(true);
  };

  if (done) {
    return (
      <MobileShell withNav={false}>
        <div className="px-5 pt-16 pb-10 flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full gradient-green flex items-center justify-center shadow-soft mb-5"><Check className="h-12 w-12 text-white" strokeWidth={3} /></div>
          <h2 className="text-2xl font-bold">Alerta publicado</h2>
          <p className="text-sm text-muted-foreground mt-2">A comunidade foi notificada.</p>
          <Button onClick={() => nav("/operator/alert")} size="lg" className="mt-8 w-full h-14 rounded-2xl">Voltar</Button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell withNav={false}>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : nav("/operator/alert")} className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Passo {step} de 4</div>
          <div className="font-semibold">Criar alerta</div>
        </div>
      </header>
      <div className="px-5 mb-4"><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full gradient-red transition-all" style={{ width: `${(step / 4) * 100}%` }} /></div></div>

      {step === 1 && (
        <div className="px-5 pb-32 space-y-2.5">
          {TYPES.map((t) => {
            const Icon = t.icon; const sel = type?.id === t.id;
            return (
              <button key={t.id} onClick={() => setType(t)} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left border-2 tap-scale ${sel ? "border-primary bg-accent" : "border-transparent bg-card shadow-card"}`}>
                <div className="h-12 w-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center"><Icon className="h-6 w-6" /></div>
                <span className="flex-1 font-semibold">{t.label}</span>
                {sel && <Check className="h-5 w-5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="px-5 pb-32">
          <label className="block">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f);
            }} />
            <div className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 ${photo ? "border-primary" : "border-border bg-card"}`}>
              {photo ? <img src={photo} alt="" className="w-full h-full object-cover rounded-2xl" /> : (
                <><div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-3"><Camera className="h-8 w-8 text-primary" /></div><div className="font-semibold">Adicionar foto</div></>
              )}
            </div>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="px-5 pb-32">
          <div className="rounded-3xl overflow-hidden bg-card shadow-card">
            <OLMap height={220} showMyLocation center={coords ? [coords.lng, coords.lat] : [32.5732, -25.9692]} pickedMarker={coords} onPick={(lat, lng) => { setCoords({ lat, lng }); setArea("Localização escolhida no mapa"); }} />
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Localização</div>
                <div className="font-semibold">{area}</div>
                {coords && <div className="text-[10px] font-mono text-muted-foreground">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</div>}
              </div>
              <button onClick={detect} className="text-sm text-primary font-medium">Usar GPS</button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && type && (
        <div className="px-5 pb-32">
          <div className="bg-card rounded-3xl shadow-card divide-y divide-border">
            <div className="px-4 py-3.5 flex justify-between"><span className="text-sm text-muted-foreground">Tipo</span><span className="font-semibold text-sm">{type.label}</span></div>
            <div className="px-4 py-3.5 flex justify-between"><span className="text-sm text-muted-foreground">Severidade</span><span className="font-semibold text-sm text-danger">{type.sev}</span></div>
            <div className="px-4 py-3.5 flex justify-between"><span className="text-sm text-muted-foreground">Local</span><span className="font-semibold text-sm">{area}</span></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          <Button size="lg" disabled={step === 1 && !type} onClick={() => {
            if (step === 3) detect();
            if (step === 4) return publish();
            setStep(step + 1);
          }} className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft">
            {step === 4 ? "Publicar alerta" : "Continuar"}
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
