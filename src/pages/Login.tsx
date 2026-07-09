import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_GOOGLE_ACCOUNTS, loginWithGoogle, type GoogleProfile } from "@/lib/mockData";

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.6-2.5C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.4-4.9 9.4-8.5 0-.6-.1-1.1-.2-1.5H12z" />
    </svg>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = (profile: GoogleProfile) => {
    setLoading(true);
    setTimeout(() => {
      const { user, isNew } = loginWithGoogle(profile);
      if (isNew) return nav("/register");
      if (!user) return setLoading(false);
      if (user.role === "admin") nav("/admin");
      else if (user.role === "operator") nav("/operator");
      else nav("/home");
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col gradient-soft">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-20 w-20 rounded-3xl gradient-green flex items-center justify-center shadow-soft mb-5">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">KUBASILE</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Plataforma comunitária de clima e reciclagem — Moçambique
            </p>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-card space-y-4">
            <h2 className="text-base font-semibold text-center">Iniciar sessão</h2>

            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loading}
              onClick={() => setPickerOpen((v) => !v)}
              className="w-full h-14 rounded-2xl text-base font-semibold border-2 bg-white text-foreground hover:bg-white/90 flex items-center gap-3"
            >
              <GoogleIcon /> Continuar com Google
              <ChevronDown className={`h-4 w-4 ml-auto transition ${pickerOpen ? "rotate-180" : ""}`} />
            </Button>

            {pickerOpen && (
              <div className="rounded-2xl border border-border bg-background overflow-hidden divide-y divide-border">
                <div className="px-4 py-2.5 text-[11px] uppercase font-bold tracking-wide text-muted-foreground bg-muted/50">
                  Escolher conta demo
                </div>
                {DEMO_GOOGLE_ACCOUNTS.map((a) => (
                  <button
                    key={a.googleId}
                    onClick={() => doLogin(a)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left tap-scale"
                  >
                    <div className="h-9 w-9 rounded-full gradient-green text-white flex items-center justify-center font-bold text-sm">
                      {a.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                    </div>
                    <GoogleIcon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            )}

            <p className="text-[11px] text-center text-muted-foreground pt-1">
              Novos utilizadores serão levados para o registo.
            </p>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground pb-6">
        © KUBASILE — Comunidade & Clima
      </div>
    </div>
  );
}
