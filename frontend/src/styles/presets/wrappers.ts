import { getTokenValue } from "./getTokenValue";

export const wrappers = {
  simple: {
      padding: "32px",
      borderRadius: "8px",
      backgroundColor: getTokenValue("card-simple-background"),
      boxShadow: "none",
      rowGap: "32px",
    },
    card: {
      position: "relative",
      padding: "48px",
      backgroundColor: getTokenValue("card-background"),
      borderRadius: "24px",
      rowGap: "24px",
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      justifyContent: "left",
      alignItems: "left",
      boxShadow: getTokenValue("shadow-medium"),
      border: `1px solid ${getTokenValue("card-border")}`,
      width: "100%",
      maxWidth: "630px",
      minHeight: "auto",
      boxSizing: "border-box",
    
      "@media (maxWidth: 768px)": {
        padding: "24px",
        borderRadius: "16px",
        rowGap: "20px",
      },

      "@media (maxWidth: 480px)": {
        padding: "20px",
        borderRadius: "12px",
        rowGap: "16px",
      }
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: getTokenValue("background-overlay"),
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
      margin: 0,
    },
    custom: {
      padding: "48px",
      width: "100%",
      borderRadius: "16px",
      backgroundColor: getTokenValue("card-custom-background"),
      boxShadow: getTokenValue("shadow-small"),
    },
    signUpCard: {
      backgroundColor: getTokenValue("card-signup-background"),
      maxWidth: "400px",
      width: "100%",
      margin: "0 auto",
    },
    accountCard: {
      display: "flex",
      flexDirection: "column",
      rowGap: "20px",
      backgroundColor: getTokenValue("card-account-background"),
      width: "100%",
      padding: "64px",
      borderRadius: "24px",
      boxSizing: "border-box",
      overflow: "auto",
    },
};
