import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, User as UserIcon, Phone, MapPin, Venus, Mars, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { upsertProfile, setUserRole } from "@/lib/api";
import type { Gender } from "@/lib/types";
import logo from "../../public/mverde_logo1.svg"

export default function Register() {
    const nav = useNavigate();
    const { user, profile, role, loading, refresh } = useAuth();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("+258");
    const [gender, setGender] = useState<Gender>("F");
    const [address, setAddress] = useState("");
    const [saving, setSaving] = useState(false);

    // Pre-fill form with any existing data (e.g. name from Google metadata)
    // NOTE: We deliberately do NOT redirect based on role here.
    // Role is only assigned when the user submits this form, so auto-redirecting
    // would skip the form or cause the "5s flash then home" bug.
    useEffect(() => {
        if (loading || !user) return;
        setName(profile?.name || (user.user_metadata?.name as string) || "");
        setPhone(profile?.phone || "+258");
        setGender((profile?.gender as Gender) || "F");
        setAddress(profile?.address || profile?.area || "");
    }, [user, profile, loading]);

    // Redirect to login if not authenticated, or to home if already registered (has role)
    useEffect(() => {
        if (loading) return;
        if (!user) {
            nav("/", { replace: true });
            return;
        }
        if (role && !saving) {
            const home = role === "admin" ? "/admin" : role === "operator" ? "/operator" : "/home";
            nav(home, { replace: true });
        }
    }, [loading, user, role, saving, nav]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!name.trim()) return toast.error("Insira o seu nome");
        if (!address.trim()) return toast.error("Indique a sua morada");
        setSaving(true);
        try {
            // 1. Create / update the profile
            await upsertProfile({
                id: user.id,
                name: name.trim(),
                phone: phone.trim(),
                gender,
                address: address.trim(),
                area: address.trim(),
            });


            // 3. Refresh auth context so the new role is picked up
            await refresh();

            toast.success("Bem-vindo ao m-verde! 🌿");
            nav("/home", { replace: true });
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="min-h-screen gradient-soft px-5 py-6 flex flex-col">
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-6">
                <div className="text-center mb-6">
                    <div className="h-16 w-16 mx-auto rounded-2xl gradient-green flex items-center justify-center shadow-soft mb-3">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Completar perfil</h1>
                    <p className="text-sm text-muted-foreground mt-1">Mais um passo para começar</p>
                </div>

                {/* Account badge */}
                <div className="bg-card rounded-3xl shadow-card p-3 mb-4 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full gradient-green text-white flex items-center justify-center font-bold text-lg">
                        {(user.email ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">Conta criada</div>
                        <div className="font-semibold text-sm truncate">{user.email}</div>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-success/15 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-card rounded-3xl p-5 shadow-card space-y-4">
                    {/* Name */}
                    <div>
                        <Label className="flex items-center gap-1.5">
                            <UserIcon className="h-4 w-4" /> Nome completo
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Ana Macuácua"
                            className="mt-1.5 h-12 rounded-xl"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <Label className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" /> Número de telemóvel
                        </Label>
                        <Input
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+258 84 000 0000"
                            className="mt-1.5 h-12 rounded-xl"
                        />
                    </div>

                    {/* Gender */}
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
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setGender(v)}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 tap-scale transition-all ${sel ? "border-primary bg-accent text-primary" : "border-transparent bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs font-semibold">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <Label className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> Morada (bairro, cidade)
                        </Label>
                        <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ex: KaMaxakeni, Maputo"
                            className="mt-1.5 h-12 rounded-xl"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={saving}
                        size="lg"
                        className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft"
                    >
                        {saving ? "A criar conta…" : "Entrar"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
