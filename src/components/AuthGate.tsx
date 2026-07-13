import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PUBLIC_ROUTES = new Set(["/", "/signup"]);

export function AuthGate() {
  const { loading, user, role, profile, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const lastNav = useRef<string | null>(null);
  const blockedNotified = useRef(false);

  useEffect(() => {
    if (loading) return;
    const path = loc.pathname;

    const go = (to: string) => {
      if (path === to) return;
      if (lastNav.current === to) return;
      lastNav.current = to;
      nav(to, { replace: true });
    };

    // Utilizador bloqueado -> forçar logout com mensagem
    if (user && profile?.blocked) {
      if (!blockedNotified.current) {
        blockedNotified.current = true;
        toast.error("A sua conta foi bloqueada. Contacte o suporte.");
        void supabase.auth.signOut().then(() => signOut());
      }
      if (!PUBLIC_ROUTES.has(path)) go("/");
      return;
    }

    if (!user) {
      if (!PUBLIC_ROUTES.has(path)) go("/");
      return;
    }

    const homeByRole =
      role === "admin" ? "/admin" : role === "operator" ? "/operator" : "/home";

    if (PUBLIC_ROUTES.has(path)) {
      go(homeByRole);
      return;
    }

    if (
      role === "citizen" && profile &&
      (!profile.phone || profile.phone.trim() === "" || profile.phone.trim() === "+258") &&
      path !== "/edit-profile"
    ) {
      go("/edit-profile");
      return;
    }

    lastNav.current = null;
  }, [loading, user, role, profile, loc.pathname, nav, signOut]);

  return null;
}
