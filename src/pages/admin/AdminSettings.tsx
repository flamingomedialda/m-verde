import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettings() {
  const nav = useNavigate();
  const { signOut } = useAuth();
  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Definições</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Preferências do sistema</p>
        <div className="bg-card rounded-3xl p-6 shadow-card space-y-4">
          <Row label="Nome do sistema" value="KUBASILE" />
          <Row label="País" value="Moçambique" />
          <Row label="Idioma" value="Português" />
          <Row label="Moeda de recompensa" value="Pontos" />
          <Row label="Conversão" value="100 g = 1 ponto" />
          <Row label="Backend" value="Supabase (externo)" />
        </div>
        <div className="mt-4">
          <Button variant="destructive" className="rounded-xl" onClick={async () => { await signOut(); nav("/"); }}>
            Terminar sessão
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
