import type { ReactNode } from "react";

export function MobileShell({ children, withNav = true }: { children: ReactNode; withNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div className={`max-w-md mx-auto ${withNav ? "pb-24" : ""}`}>{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="px-5 pt-6 pb-3 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
