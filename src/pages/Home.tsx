import { Link } from "react-router-dom";
import { Bell, Gift, MapPin, AlertTriangle, ChevronRight, Leaf, Recycle, FileWarning } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { formatWeight } from "@/lib/types";

export default function Home() {
  const { profile } = useAuth();
  if (!profile) return null;
  return (
    <MobileShell>
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl gradient-green flex items-center justify-center shadow-soft"><Leaf className="h-5 w-5 text-white" /></div>
          <div>
            <div className="text-xs text-muted-foreground">Olá,</div>
            <div className="font-semibold leading-tight">{profile.name || "Cidadão"}</div>
          </div>
        </div>
        <Link to="/alerts" className="relative h-11 w-11 rounded-2xl bg-card shadow-card flex items-center justify-center tap-scale">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger"></span>
        </Link>
      </header>

      <section className="px-5 mt-4">
        <div className="relative overflow-hidden rounded-3xl p-6 gradient-green text-white shadow-soft">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10"></div>
          <div className="absolute -right-12 bottom-0 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="relative">
            <p className="text-sm/relaxed text-white/80">O seu saldo</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold tracking-tight">{profile.points}</span>
              <span className="text-base font-semibold text-white/90">pontos</span>
            </div>
            <p className="mt-1 text-xs text-white/80">Recompensas pela sua contribuição ambiental</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/15 backdrop-blur px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-white/80"><Recycle className="h-3.5 w-3.5" /> Reciclado</div>
                <div className="text-lg font-bold">{formatWeight(profile.total_g)}</div>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-white/80"><FileWarning className="h-3.5 w-3.5" /> Reportes</div>
                <div className="text-lg font-bold">{profile.reports_count}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ações principais</h2>
        <ActionCard to="/points" title="Usar pontos" desc="Troque por material escolar, recargas e mais" icon={Gift} variant="green" />
        <ActionCard to="/eco-points" title="Eco Pontos próximos" desc="Encontre locais de reciclagem perto de si" icon={MapPin} variant="blue" />
        <ActionCard to="/report" title="Reportar problema" desc="Cheias, lixo, mosquitos e mais" icon={AlertTriangle} variant="red" />
      </section>

      <BottomNav />
    </MobileShell>
  );
}

function ActionCard({ to, title, desc, icon: Icon, variant }: {
  to: string; title: string; desc: string; icon: React.ComponentType<{ className?: string }>;
  variant: "green" | "blue" | "red";
}) {
  const grad = variant === "green" ? "gradient-green" : variant === "blue" ? "gradient-blue" : "gradient-red";
  return (
    <Link to={to} className="block tap-scale">
      <div className="bg-card rounded-3xl p-4 shadow-card flex items-center gap-4 hover:shadow-soft transition-shadow">
        <div className={`h-14 w-14 rounded-2xl ${grad} flex items-center justify-center shadow-soft shrink-0`}><Icon className="h-7 w-7 text-white" /></div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{desc}</div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  );
}
