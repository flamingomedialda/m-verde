import { useNavigate } from "react-router-dom";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { Settings, HelpCircle, LogOut, Recycle, FileWarning, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatWeight } from "@/lib/types";

export default function Profile() {
  const nav = useNavigate();
  const { user, profile, signOut } = useAuth();
  if (!profile || !user) return null;

  return (
    <MobileShell>
      <PageHeader title="Perfil" />
      <div className="px-5">
        <div className="bg-card rounded-3xl p-5 shadow-card flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl gradient-green flex items-center justify-center text-white text-2xl font-bold">
            {(profile.name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lg leading-tight">{profile.name || "—"}</div>
            {profile.phone && <div className="text-sm text-muted-foreground">{profile.phone}</div>}
            {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
            {(profile.address || profile.area) && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{profile.address ?? profile.area}</div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Reciclado" value={formatWeight(profile.total_g)} icon={Recycle} />
          <Stat label="Reportes" value={String(profile.reports_count)} icon={FileWarning} />
        </div>

        <div className="mt-4 bg-card rounded-3xl shadow-card divide-y divide-border overflow-hidden">
          <button onClick={() => nav("/register")} className="w-full flex items-center gap-3 px-4 py-4 text-left tap-scale">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Settings className="h-5 w-5 text-muted-foreground" /></div>
            <span className="font-semibold">Editar perfil</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><HelpCircle className="h-5 w-5 text-muted-foreground" /></div>
            <span className="font-semibold">Ajuda & Suporte</span>
          </div>
          <button onClick={async () => { await signOut(); nav("/"); }} className="w-full flex items-center gap-3 px-4 py-4 text-left tap-scale">
            <div className="h-10 w-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center"><LogOut className="h-5 w-5" /></div>
            <span className="font-semibold text-danger">Terminar sessão</span>
          </button>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-card rounded-3xl p-4 shadow-card">
      <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mb-2"><Icon className="h-5 w-5 text-primary" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
