import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf, ChevronLeft, User as UserIcon, Phone, MapPin,
  Venus, Mars, CircleUserRound, Camera, Trash2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadPhoto } from "@/lib/api";
import type { Gender } from "@/lib/types";

export default function EditProfile() {
  const nav = useNavigate();
  const { user, profile, refresh } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+258");
  const [gender, setGender] = useState<Gender>("F");
  const [address, setAddress] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Populate fields from existing profile
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setPhone(profile.phone || "+258");
    setGender((profile.gender as Gender) || "F");
    setAddress(profile.address || profile.area || "");
    setAvatarPreview(profile.avatar_url || null);
  }, [profile]);

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!name.trim()) return toast.error("Insira o seu nome");
    if (!address.trim()) return toast.error("Indique a sua morada");

    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadPhoto(avatarFile, "avatars");
      } else if (avatarPreview === null) {
        // User removed the avatar
        avatar_url = null;
      }

      await updateProfile(user.id, {
        name: name.trim(),
        phone: phone.trim(),
        gender,
        address: address.trim(),
        area: address.trim(),
        avatar_url,
      });

      await refresh();
      toast.success("Perfil actualizado com sucesso!");
      nav("/profile", { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile || !user) return null;

  const initials = (profile.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => nav("/profile")}
          className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center tap-scale"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Perfil</div>
          <div className="font-semibold">Editar informações</div>
        </div>
        <div className="h-8 w-8 rounded-xl gradient-green flex items-center justify-center shadow-soft">
          <Leaf className="h-4 w-4 text-white" />
        </div>
      </header>

      <div className="flex-1 px-5 pb-10">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl gradient-green flex items-center justify-center shadow-soft overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">{initials}</span>
              )}
            </div>

            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-soft tap-scale"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={pickAvatar}
          />

          {avatarPreview && (
            <button
              type="button"
              onClick={removeAvatar}
              className="mt-3 flex items-center gap-1.5 text-xs text-danger font-medium tap-scale"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover foto
            </button>
          )}

          {!avatarPreview && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 text-xs text-primary font-medium"
            >
              Adicionar foto de perfil
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-card rounded-3xl p-5 shadow-card space-y-5">
          {/* Name */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5">
              <UserIcon className="h-4 w-4 text-primary" /> Nome completo
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana Macuácua"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5">
              <Phone className="h-4 w-4 text-primary" /> Número de telemóvel
            </Label>
            <Input
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+258 84 000 0000"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Gender */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Sexo</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { v: "F" as Gender, label: "Feminino", Icon: Venus },
                  { v: "M" as Gender, label: "Masculino", Icon: Mars },
                  { v: "Outro" as Gender, label: "Outro", Icon: CircleUserRound },
                ] as const
              ).map(({ v, label, Icon }) => {
                const sel = gender === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setGender(v)}
                    className={`relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 tap-scale transition-all ${
                      sel
                        ? "border-primary bg-accent text-primary shadow-soft"
                        : "border-transparent bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{label}</span>
                    {sel && (
                      <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5">
              <MapPin className="h-4 w-4 text-primary" /> Morada (bairro, cidade)
            </Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: KaMaxakeni, Maputo"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Account info — read only */}
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <div className="text-xs text-muted-foreground mb-0.5">Endereço de e-mail</div>
            <div className="text-sm font-medium truncate">{user.email}</div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-semibold shadow-soft"
          >
            {saving ? "A guardar…" : "Guardar alterações"}
          </Button>
        </form>
      </div>
    </div>
  );
}
