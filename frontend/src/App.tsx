import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAlert } from "@context/AlertContext";
import AlertManager from "@components/ui/AlertManager/AlertManager";

import "./styles/global.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgotpassword from "./pages/Forgotpassword";
import Resetpassword from "./pages/Resetpassword";
import VerifyAccount from "./pages/VerifyAccount";
import Dashboard from "./pages/Dashboard";

import { useAuth } from "@hooks/useAuth";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { alerts, removeAlert } = useAlert();

  return (
    <>
      <AlertManager alerts={alerts} onClose={removeAlert} position="top" maxAlerts={3} />

      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/reset-password" element={<Resetpassword />} />
          <Route path="/verify-account" element={<VerifyAccount />} />

          {/* Protected */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  );
}
