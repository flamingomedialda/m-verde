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
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

async function fetchProfileAndRole(
  userId: string
): Promise<{ profile: Profile | null; role: Role | null }> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roleList = (roles ?? []).map((r: { role: Role }) => r.role);
  const role: Role | null =
    roleList.includes("admin")
      ? "admin"
      : roleList.includes("operator")
        ? "operator"
        : roleList.includes("citizen")
          ? "citizen"
          : null;
  return { profile: (profile as Profile) ?? null, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  // Only true during the very first initialization — never set true again after that
  const [loading, setLoading] = useState(true);

  // Tracks whether we have completed the initial session check
  const initializedRef = useRef(false);
  // Guard to prevent overlapping in-flight profile fetches
  const fetchingRef = useRef<string | null>(null);

  const loadProfileFor = async (s: Session): Promise<void> => {
    const uid = s.user.id;
    // Skip if already fetching for this user
    if (fetchingRef.current === uid) return;
    fetchingRef.current = uid;
    try {
      const { profile, role } = await fetchProfileAndRole(uid);
      setProfile(profile);
      setRole(role);
    } finally {
      fetchingRef.current = null;
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evt, s) => {
      setSession(s);

      if (!s?.user) {
        // Signed out — clear state
        setProfile(null);
        setRole(null);
        // If we were still initializing, mark done
        if (!initializedRef.current) {
          initializedRef.current = true;
          setLoading(false);
        }
        return;
      }

      if (evt === "INITIAL_SESSION") {
        // First load — fetch profile and only then clear loading
        initializedRef.current = false; // will be cleared after fetch
        setTimeout(() => {
          void loadProfileFor(s).finally(() => {
            initializedRef.current = true;
            setLoading(false);
          });
        }, 0);
        return;
      }

      if (evt === "SIGNED_IN") {
        // Fresh login — fetch profile and only then clear loading
        setLoading(true);
        setTimeout(() => {
          void loadProfileFor(s).finally(() => {
            setLoading(false);
          });
        }, 0);
        return;
      }

      // TOKEN_REFRESHED, USER_UPDATED, etc. — just update the session silently,
      // do NOT re-fetch profile and do NOT set loading=true.
      // The token rotation happens automatically every ~5 min; we must not flash
      // a loading screen for it.
    });

    return () => subscription.unsubscribe();
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
        setProfile(profile);
        setRole(role);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, role, loading] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
