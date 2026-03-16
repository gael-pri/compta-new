import { getTokenValue } from "./getTokenValue";

export const inputs = {
  simple: {
    fontFamily: "Manrope, sans-serif",
    padding: "12px",
    height: "46px",
    width: "95%",
    color: getTokenValue("input-simple-text"),
    fontWeight: 600,
    borderRadius: "8px",
    borderColor: getTokenValue("input-simple-border"),
    borderWidth: "1px",
    fontSize: "15px",
    backgroundColor: getTokenValue("input-simple-background"),
    borderStyle: "solid",
    focus: {
      outline: "none",
      borderColor: getTokenValue("input-simple-border-focus"),
      boxShadow: getTokenValue("shadow-focus"),
    },
    placeholder: {
      opacity: "1",
      color: "inherit",
      fontFamily: "Manrope, sans-serif",
    },
  },
  intermediaire: {
    fontFamily: "Manrope, sans-serif",
    padding: "12px",
    height: "36px",
    color: getTokenValue("input-simple-text"),
    fontWeight: 600,
    borderRadius: "8px",
    borderColor: getTokenValue("input-simple-border"),
    borderWidth: "1px",
    fontSize: "15px",
    backgroundColor: getTokenValue("input-simple-background"),
    borderStyle: "solid",
    focus: {
      outline: "none",
      borderColor: getTokenValue("input-simple-border-focus"),
      boxShadow: getTokenValue("shadow-focus"),
    },
    placeholder: {
      opacity: "1",
      color: "inherit",
      fontFamily: "Manrope, sans-serif",
    },
  },
  advance: {
    fontSize: "16px",
    padding: "12px",
    border: `1px solid ${getTokenValue("input-advance-border")}`,
    borderRadius: "8px",
    width: "100%",
    backgroundColor: getTokenValue("input-advance-background"),
  },
};

export const inputField = {
    rowGap: "12px",
    width: "100%"
  };

export const inputGroup = {
    display: "flex",
    rowGap: "12px",
    columnGap: "36px",
    flexWrap: "wrap",
    alignItems: "flex-start",
    width: "100%",
  };

export const inputGroupItem = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
  };

export const inputGroupItem2 = {
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    flex: 1,
  };

export const selectStyle = {
    padding: "12px",
    width: "100%",
    height: "48px",
    color: getTokenValue("select-text"),
    borderRadius: "8px",
    borderColor: getTokenValue("select-border"),
    borderWidth: "1px",
    fontSize: "15px",
    backgroundColor: getTokenValue("select-background"),
    appearance: "none",
    cursor: "pointer",
    focus: {
      outline: "none",
      borderColor: getTokenValue("select-border-focus"),
      boxShadow: getTokenValue("shadow-focus"),
    },
  };

export const textareaStyle = {
    padding: "12px",
    width: "100%",
    height: "120px",
    color: getTokenValue("textarea-text"),
    borderRadius: "8px",
    borderColor: getTokenValue("textarea-border"),
    borderWidth: "1px",
    fontSize: "15px",
    backgroundColor: getTokenValue("textarea-background"),
    resize: "vertical",
    focus: {
      outline: "none",
      borderColor: getTokenValue("textarea-border-focus"),
      boxShadow: getTokenValue("shadow-focus"),
    },
  };

export const passwordInputWrapper = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
    marginBottom: "24px",
  };

export const togglePasswordVisibility = {
    position: "absolute",
    right: "36px",
    top: "50%",
    transform: "translateY(-50%)",
    color: getTokenValue("toggle"),
    cursor: "pointer",
    zIndex: 1,
  };

export const passwordHint = {
    fontSize: "13px",
    color: getTokenValue("password-hint"),
    marginTop: "4px",
    marginBottom: "4px",
  };

export const strengthBars = {
    display: "flex",
    gap: "4px",
    marginTop: "4px",
    marginBottom: "8px",
  };

export const strengthBar = {
    width: "25%",
    height: "6px",
    backgroundColor: getTokenValue("trengthbar-background"),
    borderRadius: "16px",
    transition: "background-color 0.3s ease",
  };

export const strengthBarFilled = {
    backgroundColor: getTokenValue("strengthbar-filled-background"),
  };

export const strengthBarFilledFirst = {
    backgroundColor: getTokenValue("strengthbar-filled-first-background"),
  };

export const dropdownStyle = {
  dropdown: {
    position: "absolute",
    top: "48px",
    left: "-10px",
    maxHeight: "200px",
    overflowY: "auto",
    padding: "4px",
    backgroundColor: "white",
    border: `1px solid ${getTokenValue("input-simple-border")}`,
    boxShadow: getTokenValue("shadow-dropdown"),
    borderRadius: "24px",
    width: "215px",
    zIndex: 10,
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: "14px",
  },
  input: {
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: "14px",
  },
  option: {
    fontFamily: "Plus Jakarta Sans, sans-serif",
    padding: "12px",
    fontSize: "14px",
    color: getTokenValue("dropdown-option-text"),
    borderRadius: "24px",
    backgroundColor: "white",
    cursor: "pointer",
    boxShadow: getTokenValue("shadow-dropdown"),
    transition: "background-color 0.2s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    hover: {
      backgroundColor: getTokenValue("purple-300"),
    },
    selected: {
      backgroundColor: "pink",
      color: "white",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "14px",
    },
    checkmark: {
      content: '"✔"',
      fontSize: "12px",
      marginLeft: "8px",
    },
  },
};
