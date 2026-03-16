import type * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { UserPort } from "@/core/ports/user.port";
import { CreateUserPayload, UpdateUserPayload } from "@/core/types/user";
import { useRoles } from "@hooks/useUsers";

import { presets } from "@styles/presets";

interface User {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  role?: string;
}

interface UserCrudProps {
  userService: UserPort;
  action: "read" | "create" | "update" | "delete" | "reset" | "none";
  userId?: string;
  
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  onClose?: (e?: any) => void;
  onSuccess?: (e?: any) => void;

  firstnameToUpdate?: string;
  lastnameToUpdate?: string;
  emailToUpdate?: string;
  usernameToUpdate?: string;
  roleToUpdate?: string;

  titleCreate?: string;
  titleRead?: string;
  titleUpdate?: string;
  titleReset?: string;
  titleDelete?: string;
  
  // Style customization props
  styles?: {
    modal?: React.CSSProperties;
    title?: React.CSSProperties;
    form?: React.CSSProperties;
    label?: React.CSSProperties;
    input?: React.CSSProperties;
    select?: React.CSSProperties;
    button?: React.CSSProperties;
    errorMessage?: React.CSSProperties;
    fieldWrapper?: React.CSSProperties;
    readField?: React.CSSProperties;
    readFieldLabel?: React.CSSProperties;
    readFieldValue?: React.CSSProperties;
    badgeStyle?: React.CSSProperties;
  };
}

function UserCrud(props: UserCrudProps) {

  const { roles } = useRoles();

  const titleCreate = "Nouvel utilisateur";
  const titleRead = "Informations";
  const titleUpdate = "Mettre à jour";
  const titleReset = "Modifier le mot de passe";
  const titleDelete = "Supprimer";

  // Lastame
  const lastnameLabel = "Nom*";
  const placeholderLastname = "Nom";

  // Firstname
  const firstnameLabel = "Prénom*";
  const placeholderFirstname = "Prénom";

  // Email
  const emailLabel = "E-mail*";
  const placeholderEmail = "E-mail";

  // Username
  const usernameLabel = "Nom d'utilisateur*";
  const placeholderUsername = "Nom d'utilisateur";

  // Role
  const roleLabel = "Rôle (niveau d'autorisation)";
  const placeholderRole = "Sélectionner...";
    
  const { action, userId, isOpen, setIsOpen, onClose, styles } = props;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    role: "",
  });
  
  // Apply custom styles or fallback to presets
  const modalStyle = { ...presets.wrappers.card, ...styles?.modal } as React.CSSProperties;
  const titleStyle = { ...presets.heading4, ...styles?.title } as React.CSSProperties;
  const formStyle = { ...presets.form, ...styles?.form } as React.CSSProperties;
  const labelStyle = { ...presets.formLabel, ...styles?.label } as React.CSSProperties;
  const inputStyle = { ...presets.inputs.simple, ...styles?.input };
  const selectStyle = { ...presets.inputs.simple, ...styles?.select };
  const buttonStyle = { ...presets.buttons.primary, ...styles?.button } as React.CSSProperties;
  const errorStyle = { ...presets.alerts.error, ...styles?.errorMessage } as React.CSSProperties;
  const fieldWrapperStyle = { 
    rowGap: presets.inputField.rowGap,
    ...styles?.fieldWrapper 
  };
  const readFieldStyle = { 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px",
    ...styles?.readField 
  } as React.CSSProperties;
  const readFieldLabelStyle = styles?.readFieldLabel || {};
  const readFieldValueStyle = styles?.readFieldValue || {};
  const badgeStyle = {
    backgroundColor: "#e0e0e0",
    color: "#333",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.85em",
    fontWeight: 500,
    ...styles?.badgeStyle
  } as React.CSSProperties;
  
  useEffect(() => {
    if (action === "update" && userId) {
      const role = roles.find(r => r.id === props.roleToUpdate)?.id || "";
      setFormState({
        first_name: props.firstnameToUpdate || "",
        last_name: props.lastnameToUpdate || "",
        email: props.emailToUpdate || "",
        username: props.usernameToUpdate || "",
        role: role,
      });
    }
  }, [action, userId, props.firstnameToUpdate, props.lastnameToUpdate, props.emailToUpdate, props.usernameToUpdate, props.roleToUpdate, roles]);

  const handleCloseModal = useCallback(() => {
    if (setIsOpen) {
      setIsOpen(false);
    }
    onClose?.();
  }, [setIsOpen, onClose]);
  

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setIsOpen) {
      setIsOpen(false);
    }
    if (props.onClose) {
      props.onClose();
    }
  };

  const getFriendlyErrorMessage = (message: string) => {
    if (message.includes("already been registered")) {
      return "Un utilisateur avec cette adresse e-mail existe déjà.";
    } 
    if (message.includes("Access denied")) {
      return "Vous n'avez pas les droits nécessaires";
    }
    return "Une erreur est survenue. Veuillez réessayer.";
  };  

  const handleUserAction = useCallback(
  async (
    action: "create" | "update" | "delete",
    data: any
  ) => {
    try {
      switch (action) {
        case "create":
          const createPayload: CreateUserPayload = {
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            role: data.role,
            username: data.username,
          };
          await props.userService.create(createPayload);
          break;

        case "update":
          const updatePayload: UpdateUserPayload = {
            id: data.id,
            firstName: data.updates.first_name,
            lastName: data.updates.last_name,
            email: data.updates.email,
            role: data.updates.role,
            username: data.updates.username,
          };
          await props.userService.update(updatePayload);
          break;

        case "delete":
          await props.userService.delete(data.id);
          break;

        default:
          return;
      }

      props.onSuccess?.();
      handleCloseModal();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Une erreur inconnue s'est produite.");
    }
  },
  [props.userService, props.onSuccess, handleCloseModal]
);

  return (
    isOpen ? (
    <div onClick={handleBackdropClick} style={presets.wrappers.overlay as React.CSSProperties}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <button
          type="button"
          onClick={handleCloseModal}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        {action === "read" ? (
          <div style={readFieldStyle}>
          <h1 style={titleStyle}>{titleRead}</h1>
      
          <div><strong style={readFieldLabelStyle}>Prénom :</strong> <span style={readFieldValueStyle}>{props.firstnameToUpdate || <i>Non renseigné</i>}</span></div>
          <div><strong style={readFieldLabelStyle}>Nom :</strong> <span style={readFieldValueStyle}>{props.lastnameToUpdate || <i>Non renseigné</i>}</span></div>
          <div><strong style={readFieldLabelStyle}>Email :</strong> <span style={readFieldValueStyle}>{props.emailToUpdate || <i>Non renseigné</i>}</span></div>
          <div><strong style={readFieldLabelStyle}>Nom d'utilisateur :</strong> <span style={readFieldValueStyle}>{props.usernameToUpdate || <i>Non renseigné</i>}</span></div>
          <div>
            <strong style={readFieldLabelStyle}>Rôle :</strong>{" "}
            {roles.find(r => r.id = props.roleToUpdate || '')?.name
             ? (
              <span style={badgeStyle}>
                {roles.find(r => r.id = props.roleToUpdate || '')?.name}
              </span>
            ) : (
              <i>Non défini</i>
            )}
          </div>
        </div>
        ) : action === "create" ? (
          <>
            <h2 style={titleStyle}>{titleCreate}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const newUser = {
                  first_name: formData.get("first_name") as string,
                  last_name: formData.get("last_name") as string,
                  email: formData.get("email") as string,
                  username: formData.get("username") as string,
                  role: formData.get("role") as string,
                };
                await handleUserAction("create", newUser);
                form.reset();
              }}
              style={formStyle}
            >
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="last_name">{lastnameLabel}</label>
                <input
                  name="last_name" 
                  type="lastname"
                  id="last_name"
                  placeholder={placeholderLastname}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="first_name">{firstnameLabel}</label>
                <input
                  name="first_name" 
                  type="firstname"
                  id="first_name"
                  placeholder={placeholderFirstname}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="email">{emailLabel}</label>
                <input
                  name="email" 
                  type="email"
                  id="email"
                  placeholder={placeholderEmail}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="username">{usernameLabel}</label>
                <input
                  name="username" 
                  type="text"
                  id="username"
                  placeholder={placeholderUsername}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="role">{roleLabel}</label>
                  <select name="role" style={selectStyle} required>
                    <option value="">Sélectionner...</option>
                    {roles.map((r) => (
                         <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              
                {error && (
                  <div style={errorStyle}>
                    {getFriendlyErrorMessage(error)}
                  </div>
                )}

              <button type="submit" style={buttonStyle}>Créer</button>
            </form>
          </>
        ) : action === "update" && userId ? (
          <>
            <h2 style={titleStyle}>{titleUpdate}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const updates = {
                  first_name: formData.get("first_name") as string,
                  last_name: formData.get("last_name") as string,
                  email: formData.get("email") as string,
                  username: formData.get("username") as string,
                  role: formData.get("role") as string,
                };
                await handleUserAction("update", { id: userId, updates });
                form.reset();
              }}
              style={formStyle}
            >
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="last_name">{lastnameLabel}</label>
                <input
                  name="last_name" 
                  type="text"
                  id="last_name"
                  placeholder={placeholderLastname}
                  value={formState.last_name}
                  onChange={(e) => setFormState({ ...formState, last_name: e.target.value })} 
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="first_name">{firstnameLabel}</label>
                <input
                  name="first_name" 
                  type="text"
                  id="first_name"
                  placeholder={placeholderFirstname}
                  value={formState.first_name}
                  onChange={(e) => setFormState({ ...formState, first_name: e.target.value })} 
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="email">{emailLabel}</label>
                <input
                  name="email" 
                  type="email"
                  id="email"
                  placeholder={placeholderEmail}
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })} 
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="username">{usernameLabel}</label>
                <input
                  name="username" 
                  type="text"
                  id="username"
                  placeholder={placeholderUsername}
                  value={formState.username}
                  onChange={(e) => setFormState({ ...formState, username: e.target.value })} 
                  style={inputStyle}
                  required
                />
              </div>
              <div style={fieldWrapperStyle}>
                <label style={labelStyle} htmlFor="role">{roleLabel}</label>
                  <select 
                    name="role" 
                    value={formState.role}
                    onChange={(e) => setFormState({ ...formState, role: e.target.value })} 
                    style={selectStyle} 
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                    
                  </select>
                </div>

                {error && (
                  <div style={errorStyle}>
                    {getFriendlyErrorMessage(error)}
                  </div>
                )}
              <button type="submit" style={buttonStyle}>Mettre à jour</button>
            </form>
          </>
         ) : action === "reset" && userId ? (
          <>
            {/* <h2 style={titleStyle}>{titleReset}</h2>
            <p style={readFieldValueStyle}>{props.emailToUpdate}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const newPassword = formData.get("password") as string;
                await handleUserAction("reset", { id: userId, newPassword });
                form.reset();
              }}
              style={formStyle}
            >
              <input 
                name="password" 
                type="password" 
                placeholder="Mot de passe" 
                style={inputStyle} 
                required 
              />
              <button type="submit" style={buttonStyle}>Modifier le mot de passe</button>
            </form> */}
          </>
        ) : action === "delete" && userId ? (
          <>
            <h2 style={titleStyle}>{titleDelete}</h2>
            <p style={readFieldValueStyle}>Êtes-vous sûr de vouloir supprimer l'utilisateur suivant ?</p>
            <p style={readFieldValueStyle}>{props.emailToUpdate}</p>
            <button
              type="button"
              onClick={() => {
                handleUserAction("delete", { id: userId });
              }}
              style={buttonStyle}
            >
              Supprimer
            </button>
          </>
        ) : (
          <div>Aucune action disponible</div>
        )}
      </div>
    </div>
    ) : null
  );
}

export default UserCrud;
