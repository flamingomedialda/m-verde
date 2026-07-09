import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MapPin, Users, PackageCheck, FileWarning, Bell, BarChart3, Settings, Leaf, LogOut } from "lucide-react";
import { logout } from "@/lib/mockData";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/eco-points", label: "Eco Pontos", icon: MapPin },
  { to: "/admin/operators", label: "Operadores", icon: Users },
  { to: "/admin/deposits", label: "Depósitos", icon: PackageCheck },
  { to: "/admin/reports", label: "Reportes", icon: FileWarning },
  { to: "/admin/alerts", label: "Alertas", icon: Bell },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Definições", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-xl gradient-green flex items-center justify-center shadow-soft">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sidebar-foreground">KUBASILE</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.exact ? pathname === it.to : pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => { logout(); nav("/"); }}
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-sidebar-accent/60"
        >
          <LogOut className="h-4 w-4" /> Terminar sessão
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden px-5 py-4 bg-card border-b border-border flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl gradient-green flex items-center justify-center">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">KUBASILE Admin</span>
        </div>
        {children}
      </main>
    </div>
  );
}
