import type * as React from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAlert } from "@context/AlertContext";

import { presets } from "@styles/presets";
import { Eye, EyeOff } from "lucide-react";

export interface ResetPasswordProps {
  // Wrapper
  wrapperStyle?: "simple" | "card" | "custom";

  // Title
  titleHeading?: "h1" | "h2" | "h3";
  title?: string;

  // Input
  inputStyle?: "simple" | "advance";

  // Password
  password?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPassword?: string;
  confirmPasswordPlaceholder?: string;
  passwordInfoText?: string;
  eyeIconColor?: string;

  // Alert
  resetSuccessMessage?: string;
  resetErrorMessage?: string;

  // Buttons
  submitButtonStyle?: "primary" | "secondary" | "tertiary";
  submitButtonText?: string;
  cancelButtonStyle?: "primary" | "secondary" | "tertiary";
  cancelButtonText?: string;

  // show / hide
  showPasswordToggle?: boolean;
  showAlerts?: boolean;
  showPasswordStrength?: boolean;

  // Events handlers
  onPasswordChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onAlertClose?: (id: string) => void;
}

function ResetPassword_(
  props: ResetPasswordProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    // Wrapper
    wrapperStyle = "card",

    // Title
    titleHeading = "h1",
    title = "Réinitialiser le mot de passe",
    
    // Input
    inputStyle = "simple",

    // Password
    passwordLabel= "Nouveau mot de passe*",
    passwordPlaceholder = "••••••••",
    confirmPasswordLabel= "Répétez le mot de passe*",
    confirmPasswordPlaceholder = "••••••••",
    passwordInfoText = "Utilisez 8 caractères ou plus en mélangeant lettres, chiffres et symboles.",
    eyeIconColor = "#666",

    // Alert
    resetSuccessMessage = "Votre mot de passe a été réinitialisé avec succès !",
    resetErrorMessage = "Votre mot de passe n'a pas pu être réinitialisé",

    // Buttons
    submitButtonStyle = "primary",
    submitButtonText = "Réinitialiser",
    cancelButtonStyle = "tertiary",
    cancelButtonText = "Annuler",

    // show / hide
    showPasswordToggle = true,
    showAlerts = true,
    showPasswordStrength = true,

    // Events handlers
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    onAlertClose,
  } = props;

  type HeadingKeys = "heading1" | "heading2" | "heading3";

  const headingKey = `heading${titleHeading.slice(1)}` as HeadingKeys;
  const headingStyle = presets[headingKey] || presets.heading1;
  const Title = titleHeading as keyof JSX.IntrinsicElements;

  const [password, setPassword] = useState(props.password || "");
  const [confirmPassword, setConfirmPassword] = useState(props.confirmPassword || "");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(password === confirmPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultErrorMessages = {
    weakPassword: "Le mot de passe est trop faible. Utilisez au moins 8 caractères avec des lettres, chiffres et symboles.",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    resetTokenInvalid: "Le lien de réinitialisation n'est pas valide",
    resetTokenExpired: "Le lien de réinitialisation a expiré",
    networkError: "Une erreur réseau s'est produite. Veuillez réessayer."
  };

  const { addAlert } = useAlert();

  const checkPasswordStrength = useCallback((password: string) => {
    const criteria = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
    const hasMinLength = password.length >= 8;
    const criteriaCount = criteria.filter(regex => regex.test(password)).length;
    const strength = hasMinLength ? criteriaCount : Math.min(criteriaCount, 2);
    setPasswordStrength(strength);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
    setPasswordsMatch(value === confirmPassword);
    if (onPasswordChange) onPasswordChange(value);
  }, [confirmPassword, onPasswordChange, checkPasswordStrength]);



  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordsMatch(password === value);
    if (onConfirmPasswordChange) onConfirmPasswordChange(value);
  }, [password, onConfirmPasswordChange]);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 1: return "#ff4d4d";
      case 2: return "#ffaa00";
      case 3: return "#c9d64f";
      case 4: return "#4caf50";
      default: return "#ddd";
    }
  };

  const renderStrengthBars = () => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      bars.push(
        <div
          key={i}
          style={{
            ...presets.strengthBar,
            backgroundColor: i < passwordStrength ? getStrengthColor(passwordStrength) : "#ddd",
          }}
        />
      );
    }
    return bars;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: string[] = [];

    if (passwordStrength < 3) {
      errors.push(defaultErrorMessages.weakPassword);
    }

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      errors.push(defaultErrorMessages.passwordMismatch);
    } else {
      setPasswordsMatch(true);
    }

    if (errors.length > 0) {
      for (const error of errors) {
        addAlert('error', error);
      }
      return;
    }

    if (onSubmit) {
      (async () => {
        try {
          await onSubmit(event);
          addAlert("success", resetSuccessMessage);
        } catch (error) {
          addAlert("error", resetErrorMessage);
        }
      })();
    }
  };

  useEffect(() => {
    const pwd = props.password || "";
    setPassword(pwd);
    checkPasswordStrength(pwd);
  }, [props.password, checkPasswordStrength]);
  
  useEffect(() => {
    setConfirmPassword(props.confirmPassword || "");
  },  [props.confirmPassword]);

  return (
    <div
      ref={ref}
      style={presets.wrappers[wrapperStyle] as React.CSSProperties}
    >
      <Title style={headingStyle}>{title}</Title>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", rowGap: presets.form.rowGap }}
      >
        <div style={{ rowGap: presets.inputField.rowGap }}>
          <label style={presets.formLabel as React.CSSProperties} htmlFor="passwordInput">{passwordLabel}</label>
          <div style={presets.passwordInputWrapper as React.CSSProperties}>
            <input
              type={showPassword ? "text" : "password"}
              id="passwordInput"
              placeholder={passwordPlaceholder}
              value={password}
              onChange={handlePasswordChange}
              required
              style={presets.inputs[inputStyle]}
              autoComplete="new-password"
            />
            {showPasswordToggle && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="icon-button"
                style={{ ...presets.togglePasswordVisibility, color: eyeIconColor} as React.CSSProperties}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {showPasswordStrength && (
            <>
              <div style={presets.strengthBars}>{renderStrengthBars()}</div>
              <small style={presets.passwordHint as React.CSSProperties}>{passwordInfoText}</small>
            </>
          )}

        </div>

        <div style={{ rowGap: presets.inputField.rowGap }}>
          <label style={presets.formLabel as React.CSSProperties} htmlFor="confirmPasswordInput">{confirmPasswordLabel}</label>
          <div style={presets.passwordInputWrapper as React.CSSProperties}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPasswordInput"
              placeholder={confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              style={presets.inputs[inputStyle]}
              autoComplete="confirm-password"
            />
            {showPasswordToggle && (
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="icon-button"
                style={{ ...presets.togglePasswordVisibility, color: eyeIconColor } as React.CSSProperties}
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
          
          {!passwordsMatch && confirmPassword.length > 0 && (
            <small style={{ color: 'red', marginTop: 4 }}>
              {defaultErrorMessages.passwordMismatch}
            </small>
          )}
          
        </div>

        <button
          type="submit"
          style={{
            ...presets.buttons[submitButtonStyle] as React.CSSProperties,
            cursor: passwordStrength < 4 || !passwordsMatch || password.length === 0 ? "not-allowed" : "pointer",
            opacity: passwordStrength < 4 || !passwordsMatch || password.length === 0 ? 0.5 : 1,
          }}
          disabled={passwordStrength < 4 || !passwordsMatch || password.length === 0}
        >
          {submitButtonText}
        </button>
      </form>

      <Link to="/login">
        <button
          type="button"
          style={presets.buttons[cancelButtonStyle] as React.CSSProperties}
        >
          {cancelButtonText}
        </button>
      </Link>
    </div>
  );
}

const ResetPassword = forwardRef(ResetPassword_);
export default ResetPassword;
