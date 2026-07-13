// Cache local de profile + role para hidratar rapidamente e sobreviver a
// falhas de rede sem perder a sessão.
import type { Profile, Role } from "@/lib/types";

const PROFILE_KEY = "kubasile-profile";
const ROLE_KEY = "kubasile-role";

export function cacheProfile(p: Profile | null) {
  try { p ? localStorage.setItem(PROFILE_KEY, JSON.stringify(p)) : localStorage.removeItem(PROFILE_KEY); } catch {}
}
export function cacheRole(r: Role | null) {
  try { r ? localStorage.setItem(ROLE_KEY, r) : localStorage.removeItem(ROLE_KEY); } catch {}
}
export function readCachedProfile(): Profile | null {
  try { const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) as Profile : null; } catch { return null; }
}
export function readCachedRole(): Role | null {
  try { return (localStorage.getItem(ROLE_KEY) as Role | null) ?? null; } catch { return null; }
}
export function clearAuthCache() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem("kubasile-operator-ecopoint");
  } catch {}
}
