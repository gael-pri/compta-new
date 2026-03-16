import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ResetpasswordComponent from "@components/authentication/ResetPassword/ResetPassword";
import { backend } from "@/core/backend";
import { presets } from "@styles/presets";

export default function Resetpassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const passwordInput = form.querySelector<HTMLInputElement>("#passwordInput");
    if (passwordInput?.value && token) {
      await backend.auth.resetPassword(passwordInput.value, token);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div style={presets.wrappers.card as React.CSSProperties}>
          <h1 style={presets.heading1}>Lien invalide</h1>
          <p style={presets.formMessage as React.CSSProperties}>
            Ce lien de reinitialisation est invalide ou a expire. Veuillez refaire une demande.
          </p>
          <Link to="/forgot-password">
            <button type="button" style={presets.buttons.primary as React.CSSProperties}>
              Mot de passe oublie
            </button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <ResetpasswordComponent onSubmit={handleSubmit} />
    </AuthLayout>
  );
}
