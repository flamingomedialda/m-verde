import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminSidebar";
import { listAllDeposits } from "@/lib/api";
import { formatWeight, type Deposit } from "@/lib/types";

type Row = Deposit & { citizen?: { id: string; name: string } };

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<Row[]>([]);
  useEffect(() => { listAllDeposits().then((d) => setDeposits(d as Row[])).catch(() => {}); }, []);
  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Depósitos</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Registos de reciclagem</p>
        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr>
              <th className="px-5 py-3 font-semibold">Cidadão</th><th className="px-5 py-3 font-semibold">Materiais</th>
              <th className="px-5 py-3 font-semibold">Peso</th><th className="px-5 py-3 font-semibold">Pontos</th>
              <th className="px-5 py-3 font-semibold">Data</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {deposits.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4 font-semibold">{d.citizen?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{d.materials.join(", ")}</td>
                  <td className="px-5 py-4 font-semibold">{d.weight_g} g <span className="text-xs text-muted-foreground">({formatWeight(d.weight_g)})</span></td>
                  <td className="px-5 py-4 text-primary font-bold">+{d.points}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{new Date(d.date).toLocaleString("pt-PT")}</td>
                </tr>
              ))}
              {deposits.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Sem depósitos ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
