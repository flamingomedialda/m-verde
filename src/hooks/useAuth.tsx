import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { EcoPoint, Profile, Role } from "@/lib/types";
import {
  cacheProfile, cacheRole, readCachedProfile, readCachedRole, clearAuthCache,
} from "@/lib/authCache";
import { saveOperatorEcoPoint, clearOperatorEcoPoint } from "@/lib/geo";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null, user: null, profile: null, role: null,
  loading: true, refresh: async () => {}, signOut: async () => {},
});

async function fetchProfileAndRole(userId: string) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roleList = (roles ?? []).map((r: { role: Role }) => r.role);
  const role: Role | null =
    roleList.includes("admin") ? "admin"
      : roleList.includes("operator") ? "operator"
        : roleList.includes("citizen") ? "citizen" : null;
  return { profile: (profile as Profile) ?? null, role };
}

async function syncOperatorEcoPointCache(profile: Profile | null, role: Role | null) {
  if (role !== "operator" || !profile?.eco_point_id) {
    clearOperatorEcoPoint();
    return;
  }
  const { data } = await supabase
    .from("eco_points").select("id,name,area,lat,lng")
    .eq("id", profile.eco_point_id).maybeSingle();
  if (data) {
    const ep = data as Pick<EcoPoint, "id" | "name" | "area" | "lat" | "lng">;
    saveOperatorEcoPoint({ id: ep.id, name: ep.name, area: ep.area, lat: ep.lat, lng: ep.lng });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Hidratar de imediato a partir da cache local — evita flashes de login
  // e mantém sessão consistente mesmo sem rede.
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => readCachedProfile());
  const [role, setRole] = useState<Role | null>(() => readCachedRole());
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const fetchingRef = useRef<string | null>(null);

  const loadProfileFor = async (s: Session) => {
    const uid = s.user.id;
    if (fetchingRef.current === uid) return;
    fetchingRef.current = uid;
    try {
      const { profile, role } = await fetchProfileAndRole(uid);
      // Só sobrescreve a cache se conseguiu carregar; se falhar mantém o valor prévio
      if (profile) { setProfile(profile); cacheProfile(profile); }
      if (role) { setRole(role); cacheRole(role); }
      await syncOperatorEcoPointCache(profile, role);
    } catch (e) {
      // Rede caiu — mantemos os valores em cache
      // eslint-disable-next-line no-console
      console.warn("[auth] fetch profile falhou, a usar cache", e);
    } finally {
      fetchingRef.current = null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evt, s) => {
      // Só limpamos estado num logout EXPLÍCITO (SIGNED_OUT).
      // Falhas de rede ou token refresh não devem apagar sessão.
      if (evt === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
        setRole(null);
        clearAuthCache();
        initializedRef.current = true;
        setLoading(false);
        return;
      }

      setSession(s);

      if (!s?.user) {
        if (!initializedRef.current) {
          initializedRef.current = true;
          setLoading(false);
        }
        return;
      }

      if (evt === "INITIAL_SESSION") {
        setTimeout(() => {
          void loadProfileFor(s).finally(() => {
            initializedRef.current = true;
            setLoading(false);
          });
        }, 0);
        return;
      }

      if (evt === "SIGNED_IN") {
        setLoading(true);
        setTimeout(() => {
          void loadProfileFor(s).finally(() => setLoading(false));
        }, 0);
        return;
      }

      // TOKEN_REFRESHED / USER_UPDATED — não mexer em profile/loading
    });

    // Quando a rede voltar, tentar refrescar a sessão silenciosamente
    const onOnline = () => { void supabase.auth.refreshSession(); };
    window.addEventListener("online", onOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("online", onOnline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      refresh: async () => {
        if (!session?.user) return;
        const { profile, role } = await fetchProfileAndRole(session.user.id);
        setProfile(profile); cacheProfile(profile);
        setRole(role); cacheRole(role);
        await syncOperatorEcoPointCache(profile, role);
      },
      signOut: async () => {
        clearAuthCache();
        await supabase.auth.signOut();
      },
    }),
    [session, profile, role, loading] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
