import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.6-2.5C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.4-4.9 9.4-8.5 0-.6-.1-1.1-.2-1.5H12z" />
    </svg>
  );
}

export default function Login() {
  const { loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Sessão iniciada");
    // Redireccionamento é tratado globalmente pelo <AuthGate />
  };

  const google = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) { setSubmitting(false); toast.error(error.message); }
  };

  // Enquanto verifica sessão ou se já existe utilizador autenticado,
  // não mostrar o formulário de login — o AuthGate trata do redirect.
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-soft">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl gradient-green flex items-center justify-center shadow-soft animate-pulse">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">A verificar sessão…</p>
        </div>
      </div>
    );
  }

  const busy = submitting;

  return (
    <div className="min-h-screen flex flex-col gradient-soft">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-20 w-20 rounded-3xl gradient-green flex items-center justify-center shadow-soft mb-5">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">KUBASILE</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Plataforma comunitária de clima e reciclagem — Moçambique
            </p>
          </div>

          <form onSubmit={signIn} className="bg-card rounded-3xl p-6 shadow-card space-y-4">
            <h2 className="text-base font-semibold text-center">Iniciar sessão</h2>

            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={google}
              className="w-full h-12 rounded-2xl text-sm font-semibold border-2 bg-white text-foreground hover:bg-white/90 flex items-center gap-3">
              <GoogleIcon /> Continuar com Google
            </Button>

            <div className="flex items-center gap-3 text-[11px] uppercase text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <Label className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com" className="mt-1.5 h-12 rounded-xl" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Palavra-passe</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="mt-1.5 h-12 rounded-xl" />
            </div>

            <Button type="submit" disabled={busy} size="lg" className="w-full h-12 rounded-2xl font-semibold shadow-soft">
              {busy ? "A entrar…" : "Entrar"}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-1">
              Ainda sem conta?{" "}
              <Link to="/signup" className="text-primary font-semibold">Criar conta</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground pb-6">© KUBASILE — Comunidade & Clima</div>
    </div>
  );
}
