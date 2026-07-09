import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, User as UserIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SignUp() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Palavra-passe muito curta");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/register`,
        data: { name: name.trim() },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Conta criada");
      nav("/register", { replace: true });
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
          <div className="h-16 w-16 mx-auto rounded-2xl gradient-green flex items-center justify-center shadow-soft mb-3">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Criar conta KUBASILE</h1>
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
