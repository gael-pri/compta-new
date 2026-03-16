import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginComponent from "@components/authentication/Login/Login";
import { useAlert } from "@context/AlertContext";

export default function Login() {
  const [searchParams] = useSearchParams();
  const { addAlert } = useAlert();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      addAlert("success", "Votre email a ete verifie avec succes ! Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams, addAlert]);

  return (
    <AuthLayout>
      <LoginComponent />
    </AuthLayout>
  );
}
