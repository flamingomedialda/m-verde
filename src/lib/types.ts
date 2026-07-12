export type Role = "citizen" | "operator" | "admin";
export type Gender = "M" | "F" | "Outro";

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  gender: Gender | null;
  address: string | null;
  area: string | null;
  avatar_url: string | null;
  points: number;
  total_g: number;
  reports_count: number;
  eco_point_id: string | null;
  created_at: string;
  role?: Role;
}

export interface EcoPoint {
  id: string;
  name: string;
  area: string;
  address: string | null;
  lat: number;
  lng: number;
  materials: string[];
  active: boolean;
  operator_id: string | null;
  created_at: string;
  distanceKm?: number;
}

export interface Deposit {
  id: string;
  citizen_id: string;
  operator_id: string | null;
  eco_point_id: string | null;
  materials: string[];
  weight_g: number;
  points: number;
  photo_url: string | null;
  date: string;
  citizen?: Pick<Profile, "id" | "name">;
}

export interface Report {
  id: string;
  citizen_id: string;
  type: string;
  area: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  status: "open" | "in_progress" | "resolved";
  date: string;
}

export interface AlertItem {
  id: string;
  operator_id: string | null;
  type: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "critical";
  area: string | null;
  lat: number | null;
  lng: number | null;
  date: string;
}

export interface Redemption {
  id: string;
  citizen_id: string;
  reward_name: string;
  points_cost: number;
  date: string;
}

export const POINTS_PER_100G = 1;
export const pointsForGrams = (g: number) => Math.floor(g / 100) * POINTS_PER_100G;

// Pontos por 100 g em função do tipo de material
export const MATERIAL_POINTS_PER_100G: Record<string, number> = {
  "Plástico": 2,
  "Vidro": 1,
  "Papel": 1,
  "Metal": 3,
};
export const pointsForMaterial = (material: string, g: number) =>
  Math.floor(g / 100) * (MATERIAL_POINTS_PER_100G[material] ?? 1);

export function formatWeight(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 1)} kg`;
  return `${g} g`;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: string;
}

// Catálogo estático de recompensas (não vive na DB)
export const REWARDS: Reward[] = [
  { id: "r1", title: "Material Escolar", description: "Kit com cadernos e canetas", points: 80, icon: "📚", category: "Educação" },
  { id: "r2", title: "Recarga Móvel 50 MT", description: "Crédito mCel/Vodacom/Movitel", points: 50, icon: "📱", category: "Comunicação" },
  { id: "r3", title: "Recarga Móvel 100 MT", description: "Crédito mCel/Vodacom/Movitel", points: 100, icon: "📱", category: "Comunicação" },
  { id: "r4", title: "Produto Reciclado", description: "Saco ecológico KUBASILE", points: 40, icon: "🛍️", category: "Produto" },
  { id: "r5", title: "Cesta Básica", description: "Cesta alimentar comunitária", points: 200, icon: "🧺", category: "Comunidade" },
  { id: "r6", title: "Vale Saúde", description: "Consulta no posto comunitário", points: 150, icon: "❤️", category: "Saúde" },
];
