import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, User as UserIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "../../public/mverde_logo1.svg"

export default function SignUp() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmePassword,setConfirmePassword]= useState("")
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Palavra-passe muito curta");
    if(password!==confirmePassword) return toast.error("Palavra-passe diferentes");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Conta criada");
      nav("/home", { replace: true });
    } else {
      toast.success("Verifique o seu email para confirmar a conta");
      nav("/");
    }
  };

  return (
    <div className="min-h-screen gradient-soft px-5 py-6 flex flex-col">
      <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground w-fit">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-6">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center text-center mb-8">
            <img src={logo} alt="logo m-verde" className=" h-18" />
            {/* <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Plataforma comunitária de clima e reciclagem — Moçambique
            </p> */}
          </div>
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Comece a reciclar e a ganhar pontos</p>
        </div>

        <form onSubmit={submit} className="bg-card rounded-3xl p-5 shadow-card space-y-4">
          <div>
            <Label className="flex items-center gap-1.5"><UserIcon className="h-4 w-4" /> Nome</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Macuácua" className="mt-1.5 h-12 rounded-xl" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="mt-1.5 h-12 rounded-xl" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Palavra-passe</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="mt-1.5 h-12 rounded-xl" />
          </div>

          <div>
            <Label className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Confirmar Palavra-passe</Label>
            <Input type="password" required minLength={6} value={confirmePassword} onChange={(e) => setConfirmePassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="mt-1.5 h-12 rounded-xl" />
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full h-12 rounded-2xl font-semibold shadow-soft">
            {loading ? "A criar…" : "Criar conta"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/" className="text-primary font-semibold">Iniciar sessão</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
