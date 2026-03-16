import type * as React from "react";
import { useAuth } from "@hooks/useAuth";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAlert } from "@context/AlertContext";
import PhoneSelector from "@components/forms/PhoneSelector/PhoneSelector";

import { presets } from "@styles/presets";
import { getTokenValue } from "@styles/presets/getTokenValue";
import { Eye, EyeOff } from "lucide-react";

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export interface SignUpProps {
  // Wrapper
  wrapperStyle?: "simple" | "card" | "custom";

  // Title
  titleHeading?: "h1" | "h2" | "h3";
  title?: string;

  // Input
  inputStyle?: "simple" | "advance";

  // Names
  firstName?: string;
  firstNameLabel?: string;
  placeholderFirstName?: string;
  lastName?: string;
  lastNameLabel?: string;
  placeholderLastName?: string;

  // Phone
  phone?: string;
  phoneLabel?: string;
  placeholderPhone?: string;

  // Email
  email?: string;
  emailLabel?: string;
  placeholderEmail?: string;

  // Password
  password?: string;
  confirmPassword?: string;
  passwordLabel?: string;
  placeholderPassword?: string;
  confirmPasswordLabel?: string;
  placeholderConfirmPassword?: string;
  isPasswordValid?: boolean;
  passwordInfoText?: string;
  eyeIconColor?: string;

  // Links
  loginLinkText?: string;
  loginLinkHref?: string;

  // Buttons
  buttonStyle?: "primary" | "secondary" | "tertiary";
  buttonAbordStyle?: "primary" | "secondary" | "tertiary";
  submitButtonText?: string;

  // OAuth
  googleButtonText?: string;
  appleButtonText?: string;
  oAuthButtonsPosition?: 'top' | 'bottom';
  oAuthSeparatorText?: string;

  // Alerts
  alertPosition?: 'top' | 'bottom' | 'inline';
  maxAlerts?: number;
  customErrorMessages?: {
    invalidEmail?: string;
    weakPassword?: string;
    passwordMismatch?: string;
    invalidPhone?: string;
    networkError?: string;
    emailExists?: string;
  };

  // Privacy
  privacyPolicyText?: string;

  // show / hide
  showLabels?: boolean;
  showPasswordToggle?: boolean;
  showOAuthButtons?: boolean;
  showPhone?: boolean;
  showPrivacyPolicy?: boolean;
  showLoginLink?: boolean;
  showPasswordStrength?: boolean;


  // Events handlers
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  onFirstNameChange?: (value: string) => void;
  onLastNameChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  onGoogleSignIn?: () => void;
  onAppleSignIn?: () => void;
  onAlertClose?: (id: string) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>, formData: FormData) => void;
}

function SignUp_(
  props: SignUpProps, 
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const  { signup } = useAuth();
  const {
  // Wrapper
  wrapperStyle = "card",

  // Title
  titleHeading = "h1",
  title = "Inscription",

  // Input
  inputStyle = "simple",

  // Names
  firstNameLabel = "Prénom",
  placeholderFirstName = "Prénom",
  lastNameLabel = "Nom",
  placeholderLastName = "Nom",

  // Phone
  phoneLabel = "Téléphone",
  placeholderPhone = "060606060606",

  // Email
  emailLabel = "Email",
  placeholderEmail = "Email",

  // Password
  passwordLabel = "Mot de passe",
  placeholderPassword = "••••••••",
  confirmPasswordLabel = "Répétez le mot de passe",
  placeholderConfirmPassword = "••••••••",
  passwordInfoText = "Utilisez 8 caractères ou plus en mélangeant lettres, chiffres et symboles.",
  eyeIconColor = "#666",

  // Links
  loginLinkText = "Déjà inscrit(e) ? CONNEXION",
  
  // Buttons
  buttonStyle = "primary",
  submitButtonText = "S'inscrire",
  buttonAbordStyle = "tertiary",

  // OAuth
  googleButtonText = "GOOGLE",
  appleButtonText = "APPLE",
  oAuthButtonsPosition = 'bottom',
  oAuthSeparatorText = "ou",

  // Privacy
  privacyPolicyText = "J'accepte la politique de confidentialité",

  // show / hide
  showPasswordToggle = true,
  showOAuthButtons = false,
  showPhone = false,
  showPrivacyPolicy = true,
  showLoginLink = true,
  showLabels = true,
  showPasswordStrength = true,


  // Events handlers
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onGoogleSignIn,
  onAppleSignIn,
  onAlertClose,
  onSubmit,
  } = props;

  type HeadingKeys = "heading1" | "heading2" | "heading3";

  const headingKey = `heading${titleHeading.slice(1)}` as HeadingKeys;
  const headingStyle = presets[headingKey] || presets.heading1;
  const Title = titleHeading as keyof JSX.IntrinsicElements;
  const [email, setEmail] = useState(props.email || "");
  const [touched, setTouched] = useState({ email: false });
  const [emailMatch, setEmailMatch] = useState(false);
  const [firstName, setFirstName] = useState(props.firstName || "");
  const [lastName, setLastName] = useState(props.lastName || "");
  const [password, setPassword] = useState(props.password || "");
  const [confirmPassword, setConfirmPassword] = useState(props.confirmPassword || "");
  const [phone, setPhone] = useState(props.phone || "");
  const [countryCode, setCountryCode] = useState("+33");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(password === confirmPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { addAlert } = useAlert();

  const [isNextStep, setIsNextStep] = useState(false);

  // Messages d'erreur par défaut
  const defaultErrorMessages = {
    invalidEmail: "L'adresse email n'est pas valide",
    emailExists: "Cette adresse email est déjà utilisée",
    weakPassword: "Le mot de passe est trop faible. Utilisez au moins 8 caractères avec des lettres, chiffres et symboles.",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    invalidPhone: "Veuillez entrer un numéro de téléphone valide",
    networkError: "Une erreur réseau s'est produite. Veuillez réessayer.",
    signupSuccess: "Votre compte a été créé avec succès! Veuillez vérifier vos emails pour confirmer votre compte."
  };

  // Définir les composants manquants
  const ArrowIcon = () => (
    <span style={{ marginLeft: "8px" }}>→</span>
  );

  // Fusionner avec les messages personnalisés
  const errorMessages = { ...defaultErrorMessages };


  // Gestion du changement des inputs
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    const isValid = validateEmail(value);
    setEmailMatch(isValid || value.length <= 5); // Pas d'erreur avant 5 caractères
    if (onEmailChange) onEmailChange(value);
  }, [onEmailChange]);

  const handleFirstNameChange = useCallback((value: string) => {
    setFirstName(value);
    if (onFirstNameChange) onFirstNameChange(value);
  }, [onFirstNameChange]);

  const handleLastNameChange = useCallback((value: string) => {
    setLastName(value);
    if (onLastNameChange) onLastNameChange(value);
  }, [onLastNameChange]);

  const checkPasswordStrength = useCallback((password: string) => {
    const criteria = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
    const hasMinLength = password.length >= 8;
    const criteriaCount = criteria.filter(regex => regex.test(password)).length;
    setPasswordStrength(hasMinLength ? criteriaCount : Math.min(criteriaCount, 2));
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

  // Fonction pour formater le numéro de téléphone à l'affichage 
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    
    // Format par groupes de 2 chiffres (XX XX XX XX XX)
    return phoneNumber.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };


  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanedValue = inputValue.replace(/[^\d]/g, '').slice(0, 15);
    setPhone(cleanedValue);

    const isValidPhone = cleanedValue.length >= 8;
    setPhoneError(!isValidPhone && cleanedValue.length > 0);

    onPhoneChange?.(cleanedValue);
  }, [onPhoneChange]);

  const renderStrengthBars = () => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      bars.push(
        <div
          key={i}
          style={{
            ...presets.strengthBar,
            backgroundColor: i < passwordStrength ? getStrengthColor(passwordStrength) : getTokenValue("grey-300"),
          }}
        />
      );
    }
    return bars;
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 1: return "#ff4d4d"; // Rouge pour faible
      case 2: return "#ffaa00"; // Orange pour moyen
      case 3: return "#c9d64f"; // Jaune-vert pour bon
      case 4: return "#4caf50"; // Vert pour excellent
      default: return "#ddd";   // Gris par défaut
    }
  };

  // Fonction de bascule pour la visibilité du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Fonction de bascule pour la visibilité de la confirmation du mot de passe
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    setEmail((prevEmail) => props.email || prevEmail);
    setFirstName((prevFirstName) => props.firstName || prevFirstName);
    setLastName((prevLastName) => props.lastName || prevLastName);
    setPassword((prevPassword) => props.password || prevPassword);
    setConfirmPassword((prevConfirmPassword) => props.confirmPassword || prevConfirmPassword);
    setPhone((prevPhone) => props.phone || prevPhone);
    if (props.password) checkPasswordStrength(props.password);
  }, [props.email, props.firstName, props.lastName, props.password, props.confirmPassword, props.phone, checkPasswordStrength]);

  // Rendu des boutons OAuth
  const renderOAuthButtons = () => {
    if (!showOAuthButtons) return null;
    
    return (
      <div style={presets.oAuthButtons as React.CSSProperties}>
        <button
          type="button"
          onClick={onGoogleSignIn}
          onKeyDown={(e) => e.key === "Enter" && onGoogleSignIn?.()}
          style={presets.oAuthButtons as React.CSSProperties}
          aria-label="Se connecter avec Google"
        >
          <img src="/google-logo.svg" alt="Logo Google" className="w-5 h-5" />
          <span>{googleButtonText}</span>
        </button>

        <button
          type="button"
          onClick={onAppleSignIn}
          onKeyDown={(e) => e.key === "Enter" && onAppleSignIn?.()}
          style={presets.oAuthButtons as React.CSSProperties}
          aria-label="Se connecter avec Apple"
        >
          <img src="/apple-logo.svg" alt="Logo Apple" className="w-5 h-5" />
          <span>{appleButtonText}</span>
        </button>
      </div>
    );
  };

  // Fonction de validation de l'email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: string[] = [];

    // Validation de l'email
    if (!validateEmail(email) && email.length > 5) {
      setEmailMatch(false);
      errors.push(errorMessages.invalidEmail);
    } else {
      setEmailMatch(true);
    }

    // Validation des mots de passe
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      errors.push(errorMessages.passwordMismatch);
    } else {
      setPasswordsMatch(true);
    }

    // Vérification de la force du mot de passe
    if (passwordStrength < 3) {
      errors.push(errorMessages.weakPassword);
    }

    // Validation du téléphone (si requis)
    if (showPhone && (!phone || phone.length < 8)) {
      setPhoneError(true);
      errors.push(errorMessages.invalidPhone);
    } else {
      setPhoneError(false);
    }

    if (errors.length > 0) {
      for (const error of errors) {
        addAlert('error', error);
      }
      return;
    }

    // Préparation des données du formulaire
    const formData = {
      email,
      password,
      firstName,
      lastName,
      phone: showPhone ? `${countryCode}${phone}` : undefined
    };

    // Soumission du formulaire
      try {
        await signup({
          email,
          password,
          firstName,
          lastName,
        });

      addAlert('success', defaultErrorMessages.signupSuccess);
      setIsNextStep(true);
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        addAlert('error', errorMessages.networkError);
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

      {isNextStep ? (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "15px", color: "#1a1a2e", lineHeight: 1.6 }}>
            Un email de vérification a été envoyé à votre adresse. Veuillez cliquer sur le lien dans l'email pour activer votre compte.
          </p>
          <Link to="/login">
            <button type="button" style={presets.buttons.primary as React.CSSProperties}>
              Retour à la connexion
            </button>
          </Link>
        </div>
      ) : (
        <>
          <form 
            onSubmit={handleSubmit} 
            style={presets.form as React.CSSProperties}
          >

            {oAuthButtonsPosition === 'top' && showOAuthButtons && renderOAuthButtons()}

            <div style={ presets.inputGroup as React.CSSProperties }>
              <div style={ presets.inputGroupItem2 as React.CSSProperties }>

                {showLabels && (
                  <label style={ presets.formLabel as React.CSSProperties } htmlFor="firstNameInput">{firstNameLabel}</label>
                )}
                  <input
                    type="text"
                    id="firstNameInput"
                    placeholder={placeholderFirstName}
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    required
                    style={presets.inputs[inputStyle]}
                    autoComplete="first-name"
                  />
              </div>

              <div style={ presets.inputGroupItem2 as React.CSSProperties }>
                {showLabels && (
                  <label style={ presets.formLabel as React.CSSProperties } htmlFor="lastNameInput">{lastNameLabel}</label>
                )}
                  <input
                    type="text"
                    id="lastNameInput"
                    placeholder={placeholderLastName}
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    required
                    style={ presets.inputs[inputStyle] }
                    autoComplete="last-name"
                  />
              </div>
          </div>


            <div style={presets.formLabel as React.CSSProperties}>
              {showLabels && (
                <label style={presets.formLabel as React.CSSProperties } htmlFor="emailInput">{emailLabel}</label>
              )}
              <input
                type="email"
                id="emailInput"
                placeholder={placeholderEmail}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                required
                style={presets.inputs[inputStyle]}
                autoComplete="email"
              />
              {touched.email && !emailMatch && (
                <small style={{ color: 'red', marginTop: 4 }}>
                  {errorMessages.invalidEmail}
                </small>
              )}
            </div>

            {showPhone && (
              <div style={presets.inputField}>
                {showLabels && (
                  <label style={presets.formLabel as React.CSSProperties} htmlFor="phoneInput">{phoneLabel}</label>
                )}
                <div style={presets.phoneInputGroup as React.CSSProperties}>
                  <PhoneSelector style={presets.phoneSelector as React.CSSProperties} />
                  <input
                    type="tel"
                    id="phoneInput"
                    placeholder={placeholderPhone}
                    value={phone ? formatPhoneDisplay(phone) : ''}
                    onChange={handlePhoneChange}
                    required={showPhone}
                    style={presets.phoneInput as React.CSSProperties}
                  />
                </div>
              </div>
            )}
            <div style={presets.inputField}>
              {showLabels && (
                <label style={presets.formLabel as React.CSSProperties} htmlFor="passwordInput">{passwordLabel}</label>
              )}
              <div style={presets.passwordInputWrapper as React.CSSProperties}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="passwordInput"
                  placeholder={placeholderPassword}
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
                    style={{ ...presets.togglePasswordVisibility, color: eyeIconColor } as React.CSSProperties}
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

            <div style={presets.inputField}>
              {showLabels && (
                <label style={presets.formLabel as React.CSSProperties} htmlFor="confirmPasswordInput">{confirmPasswordLabel}</label>
              )}
              <div style={presets.passwordInputWrapper as React.CSSProperties}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPasswordInput"
                  placeholder={placeholderConfirmPassword}
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
                  {errorMessages.passwordMismatch}
                </small>
              )}

            </div>

            {showPrivacyPolicy && (
              <div style={presets.checkboxGroup}>
                <input type="checkbox" id="termsCheckbox" required={showPrivacyPolicy} />
                <label htmlFor="termsCheckbox" style={presets.checkboxLabel as React.CSSProperties}>
                  {privacyPolicyText}
                </label>
              </div>
            )}

            <button
              type="submit"
               style={{
                ...presets.buttons[buttonStyle] as React.CSSProperties,
                cursor: passwordStrength < 4 || !passwordsMatch ? "not-allowed" : "pointer",
                opacity: passwordStrength < 4 || !passwordsMatch ? 0.5 : 1,
              }}
              disabled={passwordStrength < 4 || !passwordsMatch}
            >
              {submitButtonText} <ArrowIcon />
            </button>
          </form>

          {oAuthButtonsPosition === 'bottom' && showOAuthButtons && renderOAuthButtons()}

          {showLoginLink && (
            <Link to="/login">
              <button
                type="button"
                style={presets.buttons[buttonAbordStyle] as React.CSSProperties}
              >
                {loginLinkText}
              </button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}

const SignUp = forwardRef<HTMLDivElement, SignUpProps>(SignUp_);
export default SignUp;
