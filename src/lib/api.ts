import { supabase, PHOTOS_BUCKET } from "@/integrations/supabase/client";
import type {
  AlertItem, Deposit, EcoPoint, Product, ProductCategory, ProductStock,
  Profile, RechargeCode, Redemption, Report, Role,
} from "@/lib/types";
import { pointsForGrams } from "@/lib/types";

// -------------------- Profiles --------------------
export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function upsertProfile(row: Partial<Profile> & { id: string }) {
  const { data, error } = await supabase.from("profiles").upsert(row).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function listOperators() {
  const { data: roles, error } = await supabase.from("user_roles").select("user_id").eq("role", "operator");
  if (error) throw error;
  const ids = (roles ?? []).map((r) => r.user_id);
  if (!ids.length) return [] as Profile[];
  const { data, error: e2 } = await supabase.from("profiles").select("*").in("id", ids);
  if (e2) throw e2;
  return (data ?? []) as Profile[];
}

export async function listCitizens() {
  const { data: roles, error } = await supabase.from("user_roles").select("user_id").eq("role", "citizen");
  if (error) throw error;
  const ids = (roles ?? []).map((r) => r.user_id);
  if (!ids.length) return [] as Profile[];
  const { data, error: e2 } = await supabase.from("profiles").select("*").in("id", ids);
  if (e2) throw e2;
  return (data ?? []) as Profile[];
}

// -------------------- Roles --------------------
export async function setUserRole(userId: string, role: Role) {
  await supabase.from("user_roles").delete().eq("user_id", userId);
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) throw error;
}

// -------------------- Eco Points --------------------
export async function listEcoPoints() {
  const { data, error } = await supabase.from("eco_points").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EcoPoint[];
}

export async function createEcoPoint(row: Omit<EcoPoint, "id" | "created_at" | "distanceKm">) {
  const { data, error } = await supabase.from("eco_points").insert(row).select().single();
  if (error) throw error;
  return data as EcoPoint;
}

export async function updateEcoPoint(id: string, patch: Partial<EcoPoint>) {
  const { data, error } = await supabase.from("eco_points").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as EcoPoint;
}

export async function deleteEcoPoint(id: string) {
  const { error } = await supabase.from("eco_points").delete().eq("id", id);
  if (error) throw error;
}

// -------------------- Deposits --------------------
export async function listDepositsForCitizen(citizenId: string) {
  const { data, error } = await supabase.from("deposits").select("*").eq("citizen_id", citizenId).order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Deposit[];
}

export async function listAllDeposits() {
  const { data, error } = await supabase
    .from("deposits")
    .select("*, citizen:profiles!deposits_citizen_id_fkey(id,name)")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Deposit[];
}

export async function createDeposit(row: {
  citizen_id: string;
  operator_id: string;
  eco_point_id?: string | null;
  materials: string[];
  weight_g: number;
  photo_url?: string | null;
  points?: number;
}) {
  const points = row.points ?? pointsForGrams(row.weight_g);
  const { data, error } = await supabase.from("deposits").insert({ ...row, points }).select().single();
  if (error) throw error;
  return data as Deposit;
}

// Check whether a phone is already registered by another profile
export async function isPhoneTaken(phone: string, excludeUserId?: string): Promise<boolean> {
  const q = supabase.from("profiles").select("id").eq("phone", phone.trim()).limit(1);
  const { data, error } = await q;
  if (error) throw error;
  const list = (data ?? []) as { id: string }[];
  return list.some((r) => r.id !== excludeUserId);
}

// Update alert
export async function updateAlert(id: string, patch: Partial<AlertItem>) {
  const { error } = await supabase.from("alerts").update(patch).eq("id", id);
  if (error) throw error;
}

// -------------------- Reports --------------------
export async function listReportsForCitizen(citizenId: string) {
  const { data, error } = await supabase.from("reports").select("*").eq("citizen_id", citizenId).order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function listAllReports() {
  const { data, error } = await supabase.from("reports").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function createReport(row: {
  citizen_id: string;
  type: string;
  area?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  photo_url?: string | null;
}) {
  const { data, error } = await supabase.from("reports").insert(row).select().single();
  if (error) throw error;
  return data as Report;
}

export async function updateReportStatus(id: string, status: Report["status"]) {
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
  if (error) throw error;
}

// -------------------- Alerts --------------------
export async function listAlerts() {
  const { data, error } = await supabase.from("alerts").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlertItem[];
}

export async function createAlert(row: Omit<AlertItem, "id" | "date">) {
  const { data, error } = await supabase.from("alerts").insert(row).select().single();
  if (error) throw error;
  return data as AlertItem;
}

export async function deleteAlert(id: string) {
  const { error } = await supabase.from("alerts").delete().eq("id", id);
  if (error) throw error;
}

// -------------------- Redemptions --------------------
export async function listRedemptionsForCitizen(citizenId: string) {
  const { data, error } = await supabase.from("redemptions").select("*").eq("citizen_id", citizenId).order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Redemption[];
}

export async function redeemReward(citizenId: string, rewardName: string, pointsCost: number) {
  const { data, error } = await supabase.from("redemptions").insert({
    citizen_id: citizenId, reward_name: rewardName, points_cost: pointsCost,
  }).select().single();
  if (error) throw error;
  return data as Redemption;
}

// -------------------- Storage --------------------
export async function uploadPhoto(file: File, folder = "misc"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    upsert: false, contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
