import { Link, useLocation } from "react-router-dom";
import { Home, Bell, History, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/alerts", label: "Alertas", icon: Bell },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-float safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 pt-2">
        {tabs.map((t) => {
          const active = pathname === t.to || pathname.startsWith(t.to + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl tap-scale ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl ${active ? "bg-accent" : ""}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[11px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
