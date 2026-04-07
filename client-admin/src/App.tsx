import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AthletesPage from "./components/pages/AthletesPage";
import AthleteDetailPage from "./components/pages/AthleteDetailPage";
import CountriesPage from "./components/pages/CountriesPage";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";
import LocalesPage from "./components/pages/LocalesPage";
import LoginPage from "./components/pages/LoginPage";
import PositionsPage from "./components/pages/PositionsPage";
import TeamDetailPage from "./components/pages/TeamDetailPage";
import TeamsPage from "./components/pages/TeamsPage";
import TemplatesPage from "./components/pages/TemplatesPage";
import ChangePasswordPage from "./components/pages/ChangePasswordPage";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/locales" replace />} />
        <Route path="locales" element={<LocalesPage />} />
        <Route path="countries" element={<CountriesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/:id" element={<TeamDetailPage />} />
        <Route path="athletes" element={<AthletesPage />} />
        <Route path="athletes/:id" element={<AthleteDetailPage />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
