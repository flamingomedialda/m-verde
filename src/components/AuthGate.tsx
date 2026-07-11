import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Rotas públicas — acessíveis sem sessão
const PUBLIC_ROUTES = new Set(["/", "/signup"]);

/**
 * Componente global de verificação de utilizador.
 * Vive acima das rotas (em main.tsx) e decide para onde o utilizador deve
 * ser direccionado com base em: sessão, role e completude do perfil.
 *
 * Regras:
 * - Sem sessão -> "/" (Login), excepto se já estiver numa rota pública.
 * - Com sessão sem role -> "/register" (completar registo).
 * - Com sessão + role -> home correspondente à role, se estiver em rota pública.
 * - Cidadão com profile.phone == null -> "/edit-profile".
 */
export function AuthGate() {
  const { loading, user, role, profile } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const lastNav = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    const path = loc.pathname;

    const go = (to: string) => {
      if (path === to) return;
      if (lastNav.current === to) return;
      lastNav.current = to;
      nav(to, { replace: true });
    };

    // 1. Sem sessão
    if (!user) {
      if (!PUBLIC_ROUTES.has(path)) go("/");
      return;
    }

  

    // 3. Home por role
    const homeByRole =
      role === "admin" ? "/admin" : role === "operator" ? "/operator" : "/home";

    // Se está numa rota pública ou em /register já com role -> ir para home da role
    if (PUBLIC_ROUTES.has(path)) {
      go(homeByRole);
      return;
    }

    // 4. Cidadão sem telefone no perfil -> forçar completar perfil
    if (
      role === "citizen" &&
      profile &&
      (!profile.phone || profile.phone.trim() === "" || profile.phone.trim() === "+258") &&
      path !== "/edit-profile"
    ) {
      go("/edit-profile");
      return;
    }

    // Reset guard quando o utilizador navega manualmente
    lastNav.current = null;
  }, [loading, user, role, profile, loc.pathname, nav]);

  return null;
}
