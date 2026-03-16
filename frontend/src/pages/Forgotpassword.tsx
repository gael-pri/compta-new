import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import ForgotpasswordComponent from "@components/authentication/ForgotPassword/ForgotPassword";
import { backend } from "@/core/backend";
import { presets } from "@styles/presets";
import { Link } from "react-router-dom";

export default function Forgotpassword() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]');
    if (emailInput?.value) {
      await backend.auth.forgottenPassword(emailInput.value);
      setSent(true);
    }
  };

  return (
    <AuthLayout>
      {sent ? (
        <div style={presets.wrappers.card as React.CSSProperties}>
          <h2 style={presets.heading2}>Email envoye</h2>
          <p style={{ ...presets.formMessage as React.CSSProperties, lineHeight: 1.6 }}>
            Si un compte existe avec cette adresse email, vous recevrez un lien de reinitialisation.
          </p>
          <Link to="/login">
            <button type="button" style={presets.buttons.tertiary as React.CSSProperties}>
              Retour a la connexion
            </button>
          </Link>
        </div>
      ) : (
        <ForgotpasswordComponent onSubmit={handleSubmit} />
      )}
    </AuthLayout>
  );
}
