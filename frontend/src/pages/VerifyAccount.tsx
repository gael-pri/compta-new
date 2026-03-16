import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { presets } from "@styles/presets";

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verification manquant.");
      return;
    }

    const verify = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:60000";
        const res = await fetch(`${backendUrl}/email/verify-account`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Votre adresse email a ete verifiee avec succes !");
        } else {
          setStatus("error");
          setMessage(data.error || "Lien de verification invalide ou expire.");
        }
      } catch {
        setStatus("error");
        setMessage("Une erreur est survenue. Veuillez reessayer.");
      }
    };

    verify();
  }, [token]);

  return (
    <AuthLayout>
      <div style={presets.wrappers.card as React.CSSProperties}>
        <h2 style={presets.heading2}>Verification de votre email</h2>

        {status === "loading" && (
          <p style={presets.formMessage as React.CSSProperties}>Verification en cours...</p>
        )}

        {status === "success" && (
          <>
            <p style={{ ...presets.formMessage as React.CSSProperties, color: "#22c55e" }}>{message}</p>
            <Link to="/login">
              <button type="button" style={presets.buttons.primary as React.CSSProperties}>
                Se connecter
              </button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p style={{ ...presets.formMessage as React.CSSProperties, color: "#ef4444" }}>{message}</p>
            <Link to="/login">
              <button type="button" style={presets.buttons.tertiary as React.CSSProperties}>
                Retour a la connexion
              </button>
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
