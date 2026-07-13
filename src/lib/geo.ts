// Utilitários de geolocalização — cálculo de distância e wrapper para navigator.geolocation

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // raio da Terra em metros
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Geolocalização não suportada"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 15000,
      ...options,
    });
  });
}

// -------- Cache do Eco Ponto do Operador ------------
const OPERATOR_EP_KEY = "kubasile-operator-ecopoint";

export interface CachedEcoPoint {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  cached_at: number;
}

export function saveOperatorEcoPoint(ep: Omit<CachedEcoPoint, "cached_at">) {
  try {
    localStorage.setItem(OPERATOR_EP_KEY, JSON.stringify({ ...ep, cached_at: Date.now() }));
  } catch {}
}
export function getOperatorEcoPoint(): CachedEcoPoint | null {
  try {
    const raw = localStorage.getItem(OPERATOR_EP_KEY);
    return raw ? (JSON.parse(raw) as CachedEcoPoint) : null;
  } catch { return null; }
}
export function clearOperatorEcoPoint() {
  try { localStorage.removeItem(OPERATOR_EP_KEY); } catch {}
}

export const OPERATOR_RADIUS_M = 100;

export async function assertOperatorInRadius(): Promise<{ ok: boolean; distance: number; ep: CachedEcoPoint | null; error?: string }> {
  const ep = getOperatorEcoPoint();
  if (!ep) return { ok: false, distance: 0, ep: null, error: "Sem Eco Ponto associado. Contacte o administrador." };
  try {
    const pos = await getCurrentPosition();
    const d = haversineMeters(pos.coords.latitude, pos.coords.longitude, ep.lat, ep.lng);
    return { ok: d <= OPERATOR_RADIUS_M, distance: d, ep };
  } catch (e) {
    return { ok: false, distance: 0, ep, error: (e as Error).message || "Não foi possível obter a localização" };
  }
}
