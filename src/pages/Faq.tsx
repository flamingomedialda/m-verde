import { Link } from "react-router-dom";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { ChevronLeft, Mail } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "suporte@mverde.co.mz";

const FAQS = [
  { q: "Como ganho pontos?", a: "Sempre que entrega materiais recicláveis num Eco Ponto, o operador regista o peso e o sistema calcula automaticamente os seus pontos (plástico: 2, metal: 3, papel/vidro: 1 pt por cada 100 g)." },
  { q: "Onde posso trocar os meus pontos?", a: "Vá a Loja de Pontos, escolha um produto. Recargas são entregues como código no ecrã; produtos físicos (cadernos, cestas) são levantados no Eco Ponto que escolher." },
  { q: "Como sei se um Eco Ponto está aberto?", a: "Na aba Eco Pontos vê a lista com o estado (activo/inactivo) e a distância a partir da sua localização." },
  { q: "O que faço se um Eco Ponto está cheio ou fechado?", a: "Crie um Reporte na aba Reportar — o operador da zona é notificado e resolve o mais rápido possível." },
  { q: "Posso ter mais do que uma conta com o mesmo número?", a: "Não. Cada número de telemóvel só pode estar associado a um perfil." },
  { q: "Perdi a minha recarga. Consigo recuperar?", a: "Os códigos são de uso único e não podem ser reemitidos. Guarde sempre uma cópia depois de trocar." },
  { q: "Como me torno operador?", a: "Fale com a equipa de administração. Só a administração pode promover cidadãos a operadores." },
  { q: "Os meus dados estão protegidos?", a: "Sim. Usamos autenticação segura e todos os dados são guardados com controlo de acesso rigoroso (RLS)." },
];

export default function Faq() {
  return (
    <MobileShell>
      <Link to="/profile" className="mx-5 mt-5 flex items-center gap-1 text-sm text-muted-foreground w-fit">
        <ChevronLeft className="h-4 w-4" /> Perfil
      </Link>
      <PageHeader title="Ajuda & Suporte" subtitle="Perguntas frequentes" />

      <div className="px-5">
        <div className="bg-card rounded-3xl shadow-card p-2">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`i${i}`}>
                <AccordionTrigger className="px-3 text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="px-3 text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-5 bg-card rounded-3xl shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-accent text-primary flex items-center justify-center"><Mail className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Não encontrou resposta?</div>
              <div className="text-xs text-muted-foreground">Envie um email para a nossa equipa.</div>
            </div>
          </div>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Ajuda%20M-verde`}>
            <Button className="w-full mt-4 h-12 rounded-2xl">Enviar email · {SUPPORT_EMAIL}</Button>
          </a>
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  );
}
