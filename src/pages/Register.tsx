import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf, ChevronLeft, User as UserIcon, Phone, MapPin, Venus, Mars, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { upsertProfile } from "@/lib/api";
import type { Gender } from "@/lib/types";

export default function Register() {
  const nav = useNavigate();
  const { user, profile, role, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+258");
  const [gender, setGender] = useState<Gender>("F");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav("/"); return; }
    setName(profile?.name || (user.user_metadata?.name as string) || "");
    setPhone(profile?.phone || "+258");
    setGender((profile?.gender as Gender) || "F");
    setAddress(profile?.address || "");
  }, [user, profile, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) return toast.error("Insira o seu nome");
    if (!address.trim()) return toast.error("Indique a sua morada");
    setSaving(true);
    try {
      await upsertProfile({
        id: user.id,
        name: name.trim(),
        phone: phone.trim(),
        gender,
        address: address.trim(),
        area: address.trim(),
      });
      await refresh();
      toast.success("Perfil actualizado");
      const home = role === "admin" ? "/admin" : role === "operator" ? "/operator" : "/home";
      nav(home, { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setSaving(false); }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen gradient-soft px-5 py-6 flex flex-col">
      <Link to="/home" className="flex items-center gap-1 text-sm text-muted-foreground w-fit">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-6">
        <div className="text-center mb-6">
          <div className="h-16 w-16 mx-auto rounded-2xl gradient-green flex items-center justify-center shadow-soft mb-3">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Completar perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">Precisamos de alguns dados extra</p>
        </div>

        <div className="bg-card rounded-3xl shadow-card p-3 mb-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-full gradient-green text-white flex items-center justify-center font-bold">
            {(user.email ?? "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">Conta</div>
            <div className="font-semibold text-sm truncate">{user.email}</div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-card rounded-3xl p-5 shadow-card space-y-4">
          <div>
            <Label className="flex items-center gap-1.5"><UserIcon className="h-4 w-4" /> Nome completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Macuácua" className="mt-1.5 h-12 rounded-xl" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> Número de telemóvel</Label>
            <Input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+258 84 000 0000" className="mt-1.5 h-12 rounded-xl" />
          </div>
          <div>
            <Label>Sexo</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {([
                { v: "F" as Gender, label: "Feminino", Icon: Venus },
                { v: "M" as Gender, label: "Masculino", Icon: Mars },
                { v: "Outro" as Gender, label: "Outro", Icon: CircleUserRound },
              ]).map(({ v, label, Icon }) => {
                const sel = gender === v;
                return (
                  <button key={v} type="button" onClick={() => setGender(v)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 tap-scale ${sel ? "border-primary bg-accent text-primary" : "border-transparent bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Morada (bairro, cidade)</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: KaMaxakeni, Maputo" className="mt-1.5 h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={saving} size="lg" className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft">
            {saving ? "A guardar…" : "Guardar perfil"}
          </Button>
        </form>
      </div>
    </div>
  );
}
