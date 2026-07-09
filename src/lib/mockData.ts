// Mock data + local persistence for KUBASILE PWA (Moçambique)

export type Role = "citizen" | "operator" | "admin";
export type Gender = "M" | "F" | "Outro";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: Role;
  gender?: Gender;
  address?: string;
  area?: string;
  avatarUrl?: string;
  googleId?: string;
  points: number;
  totalG: number;      // total reciclado em GRAMAS
  reportsCount: number;
  ecoPointId?: string;
}

export interface EcoPoint {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  active: boolean;
  distanceKm?: number;
}

export interface Deposit {
  id: string;
  citizenId: string;
  citizenName: string;
  operatorId: string;
  materials: string[];
  weightG: number;     // peso em GRAMAS
  points: number;
  date: string;
}

export interface Report {
  id: string;
  type: string;
  photo?: string;
  area: string;
  citizenId: string;
  date: string;
}

export interface AlertItem {
  id: string;
  type: "flooding" | "trash" | "health" | "drainage";
  severity: "critical" | "medium" | "low";
  title: string;
  description: string;
  area: string;
  date: string;
  operatorId?: string;
  lat?: number;
  lng?: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: string;
}

// Fórmula: 1 ponto por cada 100 gramas (10 pts/kg)
export const POINTS_PER_100G = 1;
export const pointsForGrams = (g: number) => Math.floor(g / 100) * POINTS_PER_100G;

// Formatação amigável de peso
export function formatWeight(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 1)} kg`;
  return `${g} g`;
}

// Números demo reservados a roles
export const ROLE_PHONES: Record<string, Role> = {
  "+258840000001": "admin",
  "+258840000002": "operator",
};
export function detectRole(phone: string): Role {
  return ROLE_PHONES[phone] ?? "citizen";
}

// ---------- Mock Google "accounts" ----------
export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

// Contas Google de demonstração (o botão pede para escolher uma)
export const DEMO_GOOGLE_ACCOUNTS: GoogleProfile[] = [
  { googleId: "gg_admin",    email: "admin@kubasile.mz",     name: "Admin KUBASILE",     avatarUrl: "" },
  { googleId: "gg_operator", email: "operador@kubasile.mz",  name: "Carlos Matsinhe",    avatarUrl: "" },
  { googleId: "gg_citizen",  email: "ana.macuacua@gmail.com",name: "Ana Macuácua",       avatarUrl: "" },
  { googleId: "gg_new",      email: "novo.utilizador@gmail.com", name: "Novo Utilizador",avatarUrl: "" },
];

// ------------ Seeds ------------
const seedUsers: User[] = [
  {
    id: "u1", googleId: "gg_citizen", name: "Ana Macuácua", email: "ana.macuacua@gmail.com",
    phone: "+258841234567", role: "citizen", gender: "F", address: "Av. Josina Machel, KaMaxakeni",
    area: "Maputo - KaMaxakeni", points: 120, totalG: 48000, reportsCount: 3,
  },
  {
    id: "u2", googleId: "gg_operator", name: "Carlos Matsinhe", email: "operador@kubasile.mz",
    phone: "+258840000002", role: "operator", gender: "M", address: "KaMaxakeni, Maputo",
    area: "Maputo - KaMaxakeni", points: 0, totalG: 0, reportsCount: 0, ecoPointId: "ep1",
  },
  {
    id: "u3", googleId: "gg_admin", name: "Admin KUBASILE", email: "admin@kubasile.mz",
    phone: "+258840000001", role: "admin", gender: "Outro", address: "Sede KUBASILE, Maputo",
    points: 0, totalG: 0, reportsCount: 0,
  },
  {
    id: "u4", googleId: "gg_maria", name: "Maria Tembe", email: "maria.tembe@gmail.com",
    phone: "+258842345678", role: "citizen", gender: "F", address: "Machava, Matola",
    area: "Matola - Machava", points: 80, totalG: 30000, reportsCount: 1,
  },
];

const seedEcoPoints: EcoPoint[] = [
  { id: "ep1", name: "Eco Ponto Mercado do Xipamanine", area: "KaMaxakeni, Maputo", lat: -25.9714, lng: 32.5775, active: true, distanceKm: 0.8 },
  { id: "ep2", name: "Eco Ponto Matola Mercado", area: "Matola", lat: -25.9622, lng: 32.4589, active: true, distanceKm: 2.1 },
  { id: "ep3", name: "Eco Ponto Polana", area: "KaMpfumo, Maputo", lat: -25.9620, lng: 32.5996, active: true, distanceKm: 3.4 },
  { id: "ep4", name: "Eco Ponto Costa do Sol", area: "KaMavota, Maputo", lat: -25.9261, lng: 32.6206, active: false, distanceKm: 4.0 },
];

const seedAlerts: AlertItem[] = [
  { id: "a1", type: "flooding", severity: "critical", title: "Risco de cheia em KaMaxakeni", description: "Forte acumulação de água nas vias principais.", area: "KaMaxakeni, Maputo", date: new Date(Date.now() - 3600_000).toISOString() },
  { id: "a2", type: "trash", severity: "medium", title: "Acumulação de lixo no Mercado da Matola", description: "Lixo acumulado próximo do mercado.", area: "Matola", date: new Date(Date.now() - 86400_000).toISOString() },
  { id: "a3", type: "health", severity: "low", title: "Risco de mosquitos em Polana", description: "Água parada detectada na zona.", area: "KaMpfumo, Maputo", date: new Date(Date.now() - 172800_000).toISOString() },
];

const seedRewards: Reward[] = [
  { id: "r1", title: "Material Escolar", description: "Kit com cadernos e canetas", points: 80, icon: "📚", category: "Educação" },
  { id: "r2", title: "Recarga Móvel 50 MT", description: "Crédito mCel/Vodacom/Movitel", points: 50, icon: "📱", category: "Comunicação" },
  { id: "r3", title: "Recarga Móvel 100 MT", description: "Crédito mCel/Vodacom/Movitel", points: 100, icon: "📱", category: "Comunicação" },
  { id: "r4", title: "Produto Reciclado", description: "Saco ecológico KUBASILE", points: 40, icon: "🛍️", category: "Produto" },
  { id: "r5", title: "Cesta Básica", description: "Cesta alimentar comunitária", points: 200, icon: "🧺", category: "Comunidade" },
  { id: "r6", title: "Vale Saúde", description: "Consulta no posto comunitário", points: 150, icon: "❤️", category: "Saúde" },
];

const seedDeposits: Deposit[] = [
  { id: "d1", citizenId: "u1", citizenName: "Ana Macuácua", operatorId: "u2", materials: ["Plástico", "Vidro"], weightG: 15000, points: pointsForGrams(15000), date: new Date(Date.now() - 86400_000 * 2).toISOString() },
  { id: "d2", citizenId: "u4", citizenName: "Maria Tembe", operatorId: "u2", materials: ["Papel"], weightG: 8000, points: pointsForGrams(8000), date: new Date(Date.now() - 86400_000).toISOString() },
];

const seedReports: Report[] = [
  { id: "rp1", type: "Lixo Acumulado", area: "KaMaxakeni, Maputo", citizenId: "u1", date: new Date(Date.now() - 86400_000 * 3).toISOString() },
];

// ------------ Storage ------------
const KEY = "kubasile_state_v3";

interface State {
  users: User[];
  ecoPoints: EcoPoint[];
  deposits: Deposit[];
  reports: Report[];
  alerts: AlertItem[];
  rewards: Reward[];
  currentUserId?: string;
}

function seed(): State {
  return {
    users: seedUsers, ecoPoints: seedEcoPoints, deposits: seedDeposits,
    reports: seedReports, alerts: seedAlerts, rewards: seedRewards,
  };
}

function load(): State {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = seed();
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}

function save(s: State) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
}

export const store = {
  get: load,
  set: save,
  update(fn: (s: State) => void) {
    const s = load();
    fn(s);
    save(s);
    return s;
  },
  reset() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
  },
};

export function getCurrentUser(): User | null {
  const s = load();
  if (!s.currentUserId) return null;
  return s.users.find((u) => u.id === s.currentUserId) ?? null;
}

export function logout() {
  const s = load();
  delete s.currentUserId;
  save(s);
}

/**
 * Simula o login Google.
 * - Se já existe um user com este googleId -> autentica e devolve { user, isNew: false }.
 * - Caso contrário -> guarda o perfil pendente e devolve { user: null, isNew: true }.
 */
export function loginWithGoogle(profile: GoogleProfile): { user: User | null; isNew: boolean } {
  const s = load();
  const existing = s.users.find((u) => u.googleId === profile.googleId || u.email === profile.email);
  if (existing) {
    s.currentUserId = existing.id;
    save(s);
    return { user: existing, isNew: false };
  }
  if (typeof window !== "undefined") {
    sessionStorage.setItem("kb_pending_google", JSON.stringify(profile));
  }
  return { user: null, isNew: true };
}

export function getPendingGoogle(): GoogleProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("kb_pending_google");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export interface RegisterInput {
  name: string;
  phone: string;
  gender: Gender;
  address: string;
  area?: string;
}

/** Completa o registo depois do Google mock. */
export function registerUser(input: RegisterInput): User {
  const google = getPendingGoogle();
  const role = detectRole(input.phone);
  const s = load();

  const user: User = {
    id: "u" + Date.now(),
    googleId: google?.googleId ?? "gg_" + Date.now(),
    email: google?.email,
    avatarUrl: google?.avatarUrl,
    name: input.name,
    phone: input.phone,
    gender: input.gender,
    address: input.address,
    area: input.area ?? input.address,
    role,
    points: 0,
    totalG: 0,
    reportsCount: 0,
  };
  s.users.push(user);
  s.currentUserId = user.id;
  save(s);
  if (typeof window !== "undefined") sessionStorage.removeItem("kb_pending_google");
  return user;
}
