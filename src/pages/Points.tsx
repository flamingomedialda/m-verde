import { Link } from "react-router-dom";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { REWARDS } from "@/lib/types";

export default function Points() {
  const { profile } = useAuth();
  const points = profile?.points ?? 0;
  return (
    <MobileShell>
      <PageHeader title="Usar pontos" subtitle="Recompensas pela sua contribuição" />
      <div className="px-5">
        <div className="rounded-3xl p-5 gradient-green text-white shadow-soft flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center"><Wallet className="h-6 w-6" /></div>
          <div>
            <div className="text-xs text-white/80">Disponível</div>
            <div className="text-3xl font-extrabold leading-none mt-0.5">{points} pts</div>
          </div>
        </div>
      </div>
      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        {REWARDS.map((r) => {
          const canRedeem = points >= r.points;
          return (
            <Link key={r.id} to={`/points/${r.id}`} className="block tap-scale">
              <article className="bg-card rounded-3xl p-4 shadow-card h-full flex flex-col">
                <div className="h-20 rounded-2xl bg-accent flex items-center justify-center text-4xl mb-3">{r.icon}</div>
                <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">{r.category}</div>
                <div className="font-semibold leading-tight mt-1">{r.title}</div>
                <div className={`mt-auto pt-3 text-sm font-bold ${canRedeem ? "text-primary" : "text-muted-foreground"}`}>{r.points} pts</div>
              </article>
            </Link>
          );
        })}
      </section>
      <BottomNav />
    </MobileShell>
  );
}
