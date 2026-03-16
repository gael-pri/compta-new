import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { presets } from "@styles/presets";

export interface ForgotPasswordProps {
  // Wrapper
  wrapperStyle?: "simple" | "card" | "custom";
  
  // Titre
  titleHeading?: "h1" | "h2" | "h3";
  title?: string;

  // Texte explicatif
  descriptionText?: string;

  // Input
  inputStyle?: "simple" | "advance";

  // Email
  email?: string;
  emailLabel?: string;
  placeholderEmail?: string;
  
  // Boutons
  buttonSubmitStyle?: "primary" | "secondary" | "tertiary";
  submitButtonText?: string;
  buttonCancelStyle?: "primary" | "secondary" | "tertiary";
  cancelButtonText?: string;

  // Events handlers
  onEmailChange?: (value: string) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

function ForgotPassword_(
  props: ForgotPasswordProps,
  ref: React.ForwardedRef<HTMLDivElement>
){
  const {
    // Wrapper
    wrapperStyle = "card",
    
    // Titre
    titleHeading = "h1",
    title = "Mot de passe oublié ?",

    // Texte explicatif
    descriptionText = "Pas de panique, nous allons vous envoyer un e-mail pour vous aider à réinitialiser votre mot de passe.",

    // Input
    inputStyle = "simple",

    // Email
    emailLabel = "Email",
    placeholderEmail = "Entrez votre email",

    // Boutons
    buttonSubmitStyle = "primary",
    submitButtonText = "Réinitialiser",
    buttonCancelStyle = "tertiary",
    cancelButtonText = "Annuler",

    // Events handlers
    onEmailChange,
    onSubmit,
  } = props;

  type HeadingKeys = "heading1" | "heading2" | "heading3";
  
  const headingKey = `heading${titleHeading.slice(1)}` as HeadingKeys;
  const headingStyle = presets[headingKey] || presets.heading1;

  const Title = titleHeading;
  const [email, setEmail] = useState(props.email || "");

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (onEmailChange) onEmailChange(e.target.value);
  }, [onEmailChange]);

  useEffect(() => {
    setEmail(props.email || "");
  }, [props.email]);

  return (
    <div
      ref={ref}
      style={presets.wrappers[wrapperStyle] as React.CSSProperties}
    >
      <Title style={headingStyle}>{title}</Title>

      <p style={presets.formMessage as React.CSSProperties}>
        {descriptionText}
      </p>

      <form
        onSubmit={(event) => { event.preventDefault(); onSubmit?.(event); }}
        style={presets.form as React.CSSProperties}
      >
        <div style={{ rowGap: presets.inputField.rowGap }}>
          <label style={presets.formLabel as React.CSSProperties} htmlFor="email">{emailLabel}</label>
          <input
            type="email"
            id="email"
            placeholder={placeholderEmail}
            style={presets.inputs[inputStyle]} 
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
          />
        </div>

        <button type="submit" style={presets.buttons[buttonSubmitStyle] as React.CSSProperties}>
          {submitButtonText}
        </button>
      </form>

      <Link to="/login">
        <button
          type="button"
          style={presets.buttons[buttonCancelStyle] as React.CSSProperties}
        >
          {cancelButtonText}
        </button>
      </Link>
    </div>
  );
}

const ForgotPassword = React.forwardRef(ForgotPassword_);
export default ForgotPassword;
