import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { store, logout } from "@/lib/mockData";

export default function AdminSettings() {
  const nav = useNavigate();
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
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <Button variant="outline" className="rounded-xl" onClick={() => { store.reset(); location.reload(); }}>Repor dados de demonstração</Button>
          <Button variant="destructive" className="rounded-xl" onClick={() => { logout(); nav("/"); }}>Terminar sessão</Button>
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
