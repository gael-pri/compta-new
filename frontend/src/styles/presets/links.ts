import { getTokenValue } from "./getTokenValue";

export const links = {
  linkLeft: {
      color: getTokenValue("link"),
      textDecoration: "none",
      fontWeight: "bold",
      cursor: "pointer",
      alignSelf: "flex-start",
    },
    linkRight: {
      color: getTokenValue("link"),
      textDecoration: "none",
      fontWeight: "bold",
      cursor: "pointer",
      alignSelf: "flex-end",
    },
};

export const linkSignupBottom = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: "24px"
  };

export const linkSignupBottomText = {
    color: getTokenValue("link"),
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    cursor: "pointer"
  };

export const loginLinkContainer = {
    marginTop: "12px",
    textAlign: "center",
  };

export const loginLink = {
    color: getTokenValue("link"),
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    transition: "color 0.3s",
    hover: {
      color: getTokenValue("link-hover"),
      textDecoration: "underline",
    },
  };
