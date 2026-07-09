import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Navigation } from "lucide-react";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { store, type EcoPoint } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OLMap } from "@/components/OLMap";

export default function EcoPoints() {
  const [points, setPoints] = useState<EcoPoint[]>([]);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    setPoints(store.get().ecoPoints.slice().sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)));
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => setLocated(true), () => setLocated(true));
    } else setLocated(true);
  }, []);

  return (
    <MobileShell>
      <Link to="/home" className="mx-5 mt-5 flex items-center gap-1 text-sm text-muted-foreground w-fit">
        <ChevronLeft className="h-4 w-4" /> Início
      </Link>
      <PageHeader title="Eco Pontos perto de si" subtitle={located ? "Localização detectada" : "A localizar..."} />

      <div className="px-5">
        <div className="rounded-2xl overflow-hidden border border-border shadow-card">
          <OLMap
            height={220}
            showMyLocation
            markers={points.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, color: p.active ? "#16a34a" : "#94a3b8" }))}
          />
        </div>
      </div>

      <section className="px-5 mt-5 space-y-3">
        {points.map((p) => (
          <article key={p.id} className="bg-card rounded-3xl p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold leading-tight">{p.name}</h3>
                  <Badge variant={p.active ? "default" : "secondary"} className={p.active ? "bg-success text-success-foreground" : ""}>
                    {p.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.area} · a {p.distanceKm} km</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-3 h-11 rounded-xl">
              <Navigation className="h-4 w-4" /> Ver rota
            </Button>
          </article>
        ))}
      </section>

      <BottomNav />
    </MobileShell>
  );
}
