import AuthLayout from "../layouts/AuthLayout";
import SignupComponent from "@components/authentication/SignUp/SignUp";

export default function Signup() {
  return (
    <AuthLayout>
      <SignupComponent />
    </AuthLayout>
  );
}
