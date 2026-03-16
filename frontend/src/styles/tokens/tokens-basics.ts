type TokenType = "color" | "font" | "spacing" | "size";
import { colors } from "./tokens-colors";

function getColorValue(name: string): string {
  const color = colors.find(color => color.name === name);
  if (!color) {
    throw new Error(`Color with name "${name}" not found`);
  }
  return color.value;
}

export const color_basics: Array<{ name: string; displayName: string; value: string; type: TokenType }> = [

  // Primary
  { name: "primary-background", displayName: "Primary Background", value: getColorValue("primary"), type: "color" },
  { name: "primary-text", displayName: "Primary Text", value: getColorValue("white"), type: "color" },

  // Secondary
  { name: "secondary-background", displayName: "Secondary background", value: getColorValue("secondary"), type: "color" },
  { name: "secondary-background-hover", displayName: "Secondary background hover", value: getColorValue("gray-200"), type: "color" },
  { name: "secondary-text", displayName: "Secondary text", value: getColorValue("primary"), type: "color" },
  { name: "secondary-border", displayName: "Secondary border", value: getColorValue("gray-100"), type: "color" },

  // Tertiary
  { name: "tertiary-background", displayName: "Tertiary background", value: "transparent", type: "color" },
  { name: "tertiary-text", displayName: "Tertiary text", value: getColorValue("tertiary"), type: "color" },

  // Forms
  { name: "form-label-text", displayName: "Form label text", value: getColorValue("gray-800"), type: "color" },
  { name: "form-message-text", displayName: "Form message text", value: getColorValue("gray-800"), type: "color" },
  { name: "form-group-background", displayName: "Form group background", value: getColorValue("gray-50"), type: "color" },
  { name: "form-group-border", displayName: "Form group border", value: getColorValue("gray-200"), type: "color" },

  { name: "phone-background", displayName: "Phone background", value: getColorValue("gray-800"), type: "color" },
  { name: "phone-border-left", displayName: "Phone border left", value: "transparent", type: "color" },
  { name: "phone-border-right", displayName: "Phone border right", value: "transparent", type: "color" },
  { name: "phone-border-top", displayName: "Phone border top", value: getColorValue("gray-700"), type: "color" },

  // Inputs
  { name: "input-simple-text", displayName: "Input simple text", value: getColorValue("gray-800"), type: "color" },
  { name: "input-simple-background", displayName: "Input simple background", value: getColorValue("gray-100"), type: "color" },
  { name: "input-simple-border", displayName: "Input simple border", value: getColorValue("gray-400"), type: "color" },
  { name: "input-simple-border-focus", displayName: "Input simple border focus", value: getColorValue("teal-500"), type: "color" },
  { name: "input-advance-background", displayName: "Input advance background", value: getColorValue("gray-50"), type: "color" },
  { name: "input-advance-border", displayName: "Input advance border", value: getColorValue("gray-800"), type: "color" },

  { name: "select-text", displayName: "Select text", value: getColorValue("gray-400"), type: "color" },
  { name: "select-border", displayName: "Select border", value: getColorValue("gray-200"), type: "color" },
  { name: "select-background", displayName: "Select background", value: getColorValue("white"), type: "color" },
  { name: "select-border-focus", displayName: "Select border focus", value: getColorValue("teal-500"), type: "color" },

  { name: "textarea-text", displayName: "Textarea text", value: getColorValue("gray-400"), type: "color" },
  { name: "textarea-border", displayName: "Textarea border", value: getColorValue("gray-200"), type: "color" },
  { name: "textarea-background", displayName: "Textarea background", value: getColorValue("white"), type: "color" },
  { name: "textarea-border-focus", displayName: "Textarea border focus", value: getColorValue("teal-500"), type: "color" },

  { name: "toggle", displayName: "Toggle", value: getColorValue("primary"), type: "color" },
  { name: "password-hint", displayName: "Password hint", value: getColorValue("teal-600"), type: "color" },

  { name: "strengthbar-background", displayName: "Textarea border focus", value: getColorValue("teal-300"), type: "color" },
  { name: "strengthbar-filled-background", displayName: "Textarea border focus", value: getColorValue("teal-500"), type: "color" },
  { name: "strengthbar-filled-first-background", displayName: "Textarea border focus", value: getColorValue("teal-600"), type: "color" },

  // Links
  { name: "link", displayName: "Link", value: getColorValue("primary"), type: "color" },
  { name: "link-hover", displayName: "Link hover", value: getColorValue("primary"), type: "color" },

  // Typography
  { name: "heading1", displayName: "Heading 1", value: getColorValue("primary"), type: "color" },
  { name: "heading2", displayName: "Heading 2", value: getColorValue("primary"), type: "color" },
  { name: "heading3", displayName: "Heading 3", value: getColorValue("primary"), type: "color" },
  { name: "heading4", displayName: "Heading 4", value: getColorValue("primary"), type: "color" },
  { name: "check-password", displayName: "Check password", value: getColorValue("gray-700"), type: "color" },
  { name: "account-infos", displayName: "Account infos", value: getColorValue("gray-600"), type: "color" },

  // Wrappers
  { name: "background-overlay", displayName: "Background overlay", value: "#rgba(0, 0, 0, 0.4)", type: "color" },
  { name: "card-simple-background", displayName: "Card simple background", value: getColorValue("tertiary"), type: "color" },
  { name: "card-background", displayName: "Card background", value: getColorValue("bluegray-200"), type: "color" },
  { name: "card-border", displayName: "Card border", value: getColorValue("gray-100"), type: "color" },
  { name: "card-custom-background", displayName: "Card custom background", value: getColorValue("secondary"), type: "color" },
  { name: "card-signup-background", displayName: "Card signup background", value: getColorValue("white"), type: "color" },
  { name: "card-account-background", displayName: "Card account background", value: getColorValue("white"), type: "color" },

  // Warning
  { name: "warning-text", displayName: "Warning 25", value: getColorValue("tertiary"), type: "color" },
  { name: "warning-background", displayName: "Warning 25", value: getColorValue("warning-50"), type: "color" },
  { name: "warning-border", displayName: "Warning 25", value: getColorValue("warning-100"), type: "color" },

  // Other
  { name: "shadow-small", displayName: "Shadow small", value:  getColorValue("teal-300"), type: "color" },
  { name: "shadow-medium", displayName: "Shadow medium", value: "rgba(0, 0, 0, 0.05)", type: "color" },
  { name: "shadow-focus", displayName: "Shadow focus", value: "rgba(0, 0, 0, 0.05)", type: "color" },

  { name: "stroke-icone", displayName: "Stroke icone", value: getColorValue("teal-900"), type: "color" },
  { name: "stroke-icone-blanche", displayName: "Stroke icône blanche", value: getColorValue("white"), type: "color" },
];
