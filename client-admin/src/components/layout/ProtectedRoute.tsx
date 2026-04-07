import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

type Props = PropsWithChildren<{ isAuthenticated: boolean }>;

export default function ProtectedRoute({ isAuthenticated, children }: Props) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
