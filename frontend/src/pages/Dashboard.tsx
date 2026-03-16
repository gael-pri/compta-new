import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import DashboardLayout from "../layouts/DashboardLayout";
import BudgetDashboard from "./BudgetDashboard";
import BudgetAnnuel from "./BudgetAnnuel";
import Parameters from "./Parameters";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout user={user}>
      <Routes>
        <Route index element={<BudgetDashboard />} />
        <Route path="annuel" element={<BudgetAnnuel />} />
        <Route path="parameters" element={<Parameters user={user} />} />
      </Routes>
    </DashboardLayout>
  );
}
