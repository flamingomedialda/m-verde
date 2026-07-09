import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/lib/types";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: Role[];
}) {
  const { loading, user, role } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        A carregar…
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!role) return <Navigate to="/register" replace />;
  if (allow && !allow.includes(role)) {
    const home = role === "admin" ? "/admin" : role === "operator" ? "/operator" : "/home";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
