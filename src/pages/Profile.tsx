import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { getCurrentUser, logout, formatWeight, type User } from "@/lib/mockData";
import { Settings, HelpCircle, LogOut, Recycle, FileWarning, MapPin } from "lucide-react";

export default function Profile() {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(getCurrentUser()); }, []);
  if (!user) return null;

  return (
    <MobileShell>
      <PageHeader title="Perfil" />
      <div className="px-5">
        <div className="bg-card rounded-3xl p-5 shadow-card flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl gradient-green flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lg leading-tight">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.phone}</div>
            {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{user.address ?? user.area}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Reciclado" value={formatWeight(user.totalG)} icon={Recycle} />
          <Stat label="Reportes" value={String(user.reportsCount)} icon={FileWarning} />
        </div>

        <div className="mt-4 bg-card rounded-3xl shadow-card divide-y divide-border overflow-hidden">
          <Row icon={Settings} label="Definições" />
          <Row icon={HelpCircle} label="Ajuda & Suporte" />
          <button onClick={() => { logout(); nav("/"); }} className="w-full flex items-center gap-3 px-4 py-4 text-left tap-scale">
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

function Row({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Icon className="h-5 w-5 text-muted-foreground" /></div>
      <span className="font-semibold">{label}</span>
    </div>
  );
}
