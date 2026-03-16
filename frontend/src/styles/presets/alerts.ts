import { getTokenValue } from "./getTokenValue";

export const alerts = {
  error: {
      backgroundColor: getTokenValue("warning-background"),
      color: getTokenValue("warning-text"),
      border: `1px solid ${getTokenValue("warning-border")}`,
      padding: "12px",
      borderRadius: "4px",
      marginBottom: "10px",
      fontSize: "14px"
    }
};
