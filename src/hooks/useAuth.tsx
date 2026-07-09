import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Role } from "@/lib/types";

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
  session: null, user: null, profile: null, role: null, loading: true,
  refresh: async () => {}, signOut: async () => {},
});

async function fetchProfileAndRole(userId: string): Promise<{ profile: Profile | null; role: Role | null }> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roleList = (roles ?? []).map((r: { role: Role }) => r.role);
  const role: Role | null =
    roleList.includes("admin") ? "admin"
    : roleList.includes("operator") ? "operator"
    : roleList.includes("citizen") ? "citizen"
    : null;
  return { profile: (profile as Profile) ?? null, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFor = async (s: Session | null) => {
    if (!s?.user) {
      setProfile(null); setRole(null); return;
    }
    const { profile, role } = await fetchProfileAndRole(s.user.id);
    setProfile(profile);
    setRole(role);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      // Defer supabase calls
      setTimeout(() => { void loadFor(s); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadFor(data.session).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    role,
    loading,
    refresh: async () => { await loadFor(session); },
    signOut: async () => { await supabase.auth.signOut(); },
  }), [session, profile, role, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
