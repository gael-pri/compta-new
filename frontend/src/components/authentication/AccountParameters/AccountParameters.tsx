import type * as React from "react";
import { forwardRef, useState, useEffect, useCallback, useRef } from "react";
import { useUsers, useRoles } from "@hooks/useUsers";
import { uploadFiles } from "@directus/sdk";
import { directusClient, STORAGE_KEY } from "@lib/directusClient";

import { useAlert } from "@context/AlertContext";

import { presets } from "../../../styles/presets";
import styles from "./AccountParameters.module.css";
import { Eye, EyeOff, Upload } from "lucide-react";

export interface AccountParametersProps {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    image: string;
  };
  wrapperStyle?: "simple" | "card" | "custom";
  titleHeading?: "h1" | "h2" | "h3";
  title?: string;
  inputStyle?: "simple" | "advance";
  passwordLabel?: string;
  passwordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  passwordInfoText?: string;
  eyeIconColor?: string;
  submitButtonStyle?: "primary" | "secondary" | "tertiary";
  submitButtonText?: string;
  showTitle?: boolean;
  showPasswordToggle?: boolean;
  showAlerts?: boolean;
  showPasswordStrength?: boolean;
  disableRoleEdit?: boolean;
  onPasswordChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onAlertClose?: (id: string) => void;
}

const AccountParameters = forwardRef<HTMLDivElement, AccountParametersProps>(
  (
    {
      user,
      wrapperStyle = "card",
      titleHeading = "h1",
      title = "Réinitialiser le mot de passe",
      inputStyle = "intermediaire",
      passwordLabel = "Nouveau mot de passe*",
      passwordPlaceholder = "••••••••",
      confirmPasswordLabel = "Répétez le mot de passe*",
      confirmPasswordPlaceholder = "••••••••",
      passwordInfoText = "Utilisez 8 caractères ou plus en mélangeant lettres, chiffres et symboles.",
      eyeIconColor = "#666",
      submitButtonStyle = "primary",
      submitButtonText = "Enregistrer le nouveau mot de passe",
      showTitle = false,
      showPasswordToggle = true,
      showAlerts = true,
      showPasswordStrength = true,
      disableRoleEdit = true,
      onPasswordChange,
      onConfirmPasswordChange,
      onSubmit,
    },
    ref
  ) => {
    const { addAlert } = useAlert();
    const { updateUser } = useUsers();
    const { roles } = useRoles();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const role = roles.find(r => r.id === (user?.role || ''))?.name

    // === États utilisateur ===
    const [editableFirstName, setEditableFirstName] = useState(user?.firstName || "");
    const [editableLastName, setEditableLastName] = useState(user?.lastName || "");
    const [editableUserName, setEditableUserName] = useState(user?.username || "");
    const [editableEmail, setEditableEmail] = useState(user?.email || "");
    const [editableRole, setEditableRole] = useState(role || "");
    const [editableImage, setEditableImage] = useState(user?.image || "");

    // === États mot de passe ===
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const avatarUrl = "https://i.pravatar.cc/150";
    const [imgCacheBust, setImgCacheBust] = useState(0);

    const getAvatarSrc = () => {
      if (!editableImage) return avatarUrl;
      const auth = localStorage.getItem(STORAGE_KEY);
      const token = auth ? JSON.parse(auth)?.access_token : "";
      return `${directusUrl}/assets/${editableImage}?access_token=${token}${imgCacheBust ? `&t=${imgCacheBust}` : ""}`;
    };

    // === Synchronisation avec user async ===
    // useEffect(() => {
    //   if (!user) return;
    //   setEditableFirstName(user.firstName);
    //   setEditableLastName(user.lastName);
    //   setEditableUserName(user.username);
    //   setEditableEmail(user.email);
    //   setEditableRole(user.role);
    //   setEditableImage(user.image);
    // }, [user]);

    // === Gestion mot de passe ===
    const checkPasswordStrength = useCallback((value: string) => {
      const criteria = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
      const minLength = value.length >= 8;
      const strength = minLength ? criteria.filter(r => r.test(value)).length : Math.min(criteria.filter(r => r.test(value)).length, 2);
      setPasswordStrength(strength);
    }, []);

    const handlePasswordChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        checkPasswordStrength(value);
        setPasswordsMatch(value === confirmPassword);
        onPasswordChange?.(value);
      },
      [confirmPassword, checkPasswordStrength, onPasswordChange]
    );

    const handleConfirmPasswordChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setPasswordsMatch(password === value);
        onConfirmPasswordChange?.(value);
      },
      [password, onConfirmPasswordChange]
    );

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

    const getStrengthColor = (strength: number) => {
      switch (strength) {
        case 1: return "#ff4d4d";
        case 2: return "#ffaa00";
        case 3: return "#c9d64f";
        case 4: return "#4caf50";
        default: return "#ddd";
      }
    };

    const renderStrengthBars = () => Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        style={{ ...presets.strengthBar, backgroundColor: i < passwordStrength ? getStrengthColor(passwordStrength) : "#ddd" }}
      />
    ));

    // === Upload image via Directus ===
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", `profile-${user.id}`);

        const uploaded = await directusClient.request(uploadFiles(formData));
        const fileId = uploaded.id;

        await updateUser({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role,
          image: fileId,
        });

        setEditableImage(fileId);
        setImgCacheBust(Date.now());
        addAlert("success", "Photo de profil mise à jour avec succès");
      } catch (error) {
        addAlert("error", "Erreur lors du téléchargement de l'image");
      }
    };

    // === Soumission formulaire ===
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;

      const formId = e.currentTarget.id;

      if (formId === "userInfoForm") {
        try {
          await updateUser({
            id: user.id,
            firstName: editableFirstName,
            lastName: editableLastName,
            username: editableUserName,
            email: editableEmail,
            role: user.role,
            image: editableImage,
          });

          setImgCacheBust(Date.now());

          addAlert("success", "Informations utilisateur modifiées avec succès");
        } catch (error: any) {
          addAlert("error", error?.message || "Erreur inconnue");
        }
      }

      if (formId === "passwordResetForm") {
        const errors: string[] = [];
        if (passwordStrength < 3) errors.push("Mot de passe trop faible");
        if (password !== confirmPassword) errors.push("Les mots de passe ne correspondent pas");

        if (errors.length) {
          errors.forEach(err => addAlert("error", err));
          return;
        }

        try {
          await updateUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            password,
            image: editableImage,
          });
          addAlert("success", "Mot de passe modifié avec succès");
        } catch (error: any) {
          addAlert("error", error?.message || "Erreur inconnue");
        }

        if (onSubmit) await onSubmit(e);
      }
    };

    const Title = titleHeading as keyof JSX.IntrinsicElements;
    const headingKey = `heading${titleHeading.slice(1)}` as "heading1" | "heading2" | "heading3";
    const headingStyle = presets[headingKey] || presets.heading1;

    const directusUrl = import.meta.env.VITE_DIRECTUS_URL || "http://localhost:60005";

    useEffect(() => {
      if (role) {
        setEditableRole(role);
      }
    }, [role]);

    return (
      <div ref={ref} style={presets.wrappers.accountCard as React.CSSProperties}>
        {showTitle && <Title style={headingStyle}>{title}</Title>}

        {/* Formulaire infos utilisateur */}
        <form onSubmit={handleSubmit} id="userInfoForm" style={presets.form as React.CSSProperties}>
          <div style={presets.inputGroup as React.CSSProperties}>
            <div className={styles.blockImage}>

              <img src={getAvatarSrc()} className={styles.profilImage}/>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} ref={fileInputRef} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.buttonImage} >
                <Upload className={styles.iconImage} size={18} />
              </button>
            </div>
            <div style={presets.inputGroupItem as React.CSSProperties}>
              <label htmlFor="firstNameInput"><strong>Nom</strong></label>
              <input id="firstNameInput" type="text" value={editableLastName} onChange={e => setEditableLastName(e.target.value)} style={presets.inputs.intermediaire} />
            </div>
            <div style={presets.inputGroupItem as React.CSSProperties}>
              <label htmlFor="lastNameInput"><strong>Prénom</strong></label>
              <input id="lastNameInput" type="text" value={editableFirstName} onChange={e => setEditableFirstName(e.target.value)} style={presets.inputs.intermediaire} />
            </div>
          </div>
          <div style={presets.inputGroup as React.CSSProperties}>
            <div style={presets.inputGroupItem as React.CSSProperties}>
              <label htmlFor="userNameInput"><strong>Pseudo</strong></label>
              <input id="userNameInput" type="text" value={editableUserName} onChange={e => setEditableUserName(e.target.value)} style={presets.inputs.intermediaire} />
            </div>
            <div style={presets.inputGroupItem as React.CSSProperties}>
              <label htmlFor="emailInput"><strong>Email</strong></label>
              <input id="emailInput" type="email" value={editableEmail} onChange={e => setEditableEmail(e.target.value)} style={presets.inputs.intermediaire} />
            </div>
            <div style={presets.inputGroupItem as React.CSSProperties}>
              <label htmlFor="roleInput"><strong>Rôle</strong></label>
              <input id="roleInput" type="text" value={editableRole} onChange={e => setEditableRole(e.target.value)} disabled={disableRoleEdit} style={{ ...presets.inputs.intermediaire, opacity: disableRoleEdit ? 0.6 : 1 }} />
            </div>
          </div>
          <button type="submit" style={presets.buttons[submitButtonStyle] as React.CSSProperties}>Enregistrer les modifications</button>
        </form>

        {user?.role !== "admin" && <p style={presets.accountInfos}>Ces informations ne peuvent être modifiées que par un Administrateur.</p>}

        <div style={presets.separatorHr} />

        {/* Formulaire mot de passe */}
        <form onSubmit={handleSubmit} id="passwordResetForm" style={presets.form as React.CSSProperties}>
          <div style={presets.inputField}>
            <label style={presets.formLabel as React.CSSProperties} htmlFor="passwordInput">{passwordLabel}</label>
            <div style={presets.passwordInputWrapper as React.CSSProperties}>
              <input type={showPassword ? "text" : "password"} id="passwordInput" placeholder={passwordPlaceholder} value={password} onChange={handlePasswordChange} required style={presets.inputs.intermediaire} />
              {showPasswordToggle && (
                <button type="button" onClick={togglePasswordVisibility} className="icon-button" style={{ ...presets.togglePasswordVisibility, color: eyeIconColor } as React.CSSProperties}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
            {showPasswordStrength && <div style={presets.strengthBars}>{renderStrengthBars()}</div>}
            {showPasswordStrength && <small style={presets.passwordHint as React.CSSProperties}>{passwordInfoText}</small>}
          </div>

          <div style={presets.inputField}>
            <label style={presets.formLabel as React.CSSProperties} htmlFor="confirmPassword">{confirmPasswordLabel}</label>
            <div style={presets.passwordInputWrapper as React.CSSProperties}>
              <input type={showConfirmPassword ? "text" : "password"} id="confirmPasswordInput" placeholder={confirmPasswordPlaceholder} value={confirmPassword} onChange={handleConfirmPasswordChange} required style={presets.inputs.intermediaire} />
              {showPasswordToggle && (
                <button type="button" onClick={toggleConfirmPasswordVisibility} className="icon-button" style={{ ...presets.togglePasswordVisibility, color: eyeIconColor } as React.CSSProperties}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>
          <button type="submit" style={presets.buttons[submitButtonStyle] as React.CSSProperties}>{submitButtonText}</button>
        </form>
      </div>
    );
  }
);

export default AccountParameters;
