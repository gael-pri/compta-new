type TokenType = "color" | "font" | "spacing" | "size";

export const colors: Array<{ name: string; displayName: string; value: string; type: TokenType }> = [

  //////////////////
  // Primary colors

  // Basics
  { name: "primary", displayName: "Primary Color", value: "#293056ff", type: "color" },
  { name: "secondary", displayName: "Secondary Color", value: "#e1eaeaff", type: "color" },
  { name: "tertiary", displayName: "Tertiary Color", value: "#b54708ff", type: "color" },

  { name: "white", displayName: "White", value: "#ffffffff", type: "color" },
  { name: "black", displayName: "Black", value: "#000000ff", type: "color" },

  // Gray
  { name: "gray-25", displayName: "Gray 25", value: "#fdfdfdff", type: "color" },
  { name: "gray-50", displayName: "Gray 50", value: "#fafafaff", type: "color" },
  { name: "gray-100", displayName: "Gray 100", value: "#f5f5f5ff", type: "color" },
  { name: "gray-200", displayName: "Gray 200", value: "#e9eaebff", type: "color" },
  { name: "gray-300", displayName: "Gray 300", value: "#d5d7daff", type: "color" },
  { name: "gray-400", displayName: "Gray 400", value: "#a4a7aeff", type: "color" },
  { name: "gray-500", displayName: "Gray 500", value: "#717680ff", type: "color" },
  { name: "gray-600", displayName: "Gray 600", value: "#535862ff", type: "color" },
  { name: "gray-700", displayName: "Gray 700", value: "#414651ff", type: "color" },
  { name: "gray-800", displayName: "Gray 800", value: "#252b37ff", type: "color" },
  { name: "gray-900", displayName: "Gray 900", value: "#181d27ff", type: "color" },

  // Brand
  { name: "brand-25", displayName: "Brand 25", value: "#fcfaffff", type: "color" },
  { name: "brand-50", displayName: "Brand 50", value: "#f9f5ffff", type: "color" },
  { name: "brand-100", displayName: "Brand 100", value: "#f4ebffff", type: "color" },
  { name: "brand-200", displayName: "Brand 200", value: "#e9d7feff", type: "color" },
  { name: "brand-300", displayName: "Brand 300", value: "#d6bbfbff", type: "color" },
  { name: "brand-400", displayName: "Brand 400", value: "#b692f6ff", type: "color" },
  { name: "brand-500", displayName: "Brand 500", value: "#9e77edff", type: "color" },
  { name: "brand-600", displayName: "Brand 600", value: "#7f56d9ff", type: "color" },
  { name: "brand-700", displayName: "Brand 700", value: "#6941c6ff", type: "color" },
  { name: "brand-800", displayName: "Brand 800", value: "#53389eff", type: "color" },
  { name: "brand-900", displayName: "Brand 900", value: "#42307dff", type: "color" },

  // Error
  { name: "error-25", displayName: "Error 25", value: "#fffbfaff", type: "color" },
  { name: "error-50", displayName: "Error 50", value: "#fef3f2ff", type: "color" },
  { name: "error-100", displayName: "Error 100", value: "#fee4e2ff", type: "color" },
  { name: "error-200", displayName: "Error 200", value: "#fecdcaff", type: "color" },
  { name: "error-300", displayName: "Error 300", value: "#fda29bff", type: "color" },
  { name: "error-400", displayName: "Error 400", value: "#f97066ff", type: "color" },
  { name: "error-500", displayName: "Error 500", value: "#f04438ff", type: "color" },
  { name: "error-600", displayName: "Error 600", value: "#d92d20ff", type: "color" },
  { name: "error-700", displayName: "Error 700", value: "#b42318ff", type: "color" },
  { name: "error-800", displayName: "Error 800", value: "#912018ff", type: "color" },
  { name: "error-900", displayName: "Error 900", value: "#7a271aff", type: "color" },

  // Warning
  { name: "warning-25", displayName: "Warning 25", value: "#fffcf5ff", type: "color" },
  { name: "warning-50", displayName: "Warning 50", value: "#fffaebff", type: "color" },
  { name: "warning-100", displayName: "Warning 100", value: "#fef0c7ff", type: "color" },
  { name: "warning-200", displayName: "Warning 200", value: "#fedf89ff", type: "color" },
  { name: "warning-300", displayName: "Warning 300", value: "#fec84bff", type: "color" },
  { name: "warning-400", displayName: "Warning 400", value: "#fdb022ff", type: "color" },
  { name: "warning-500", displayName: "Warning 500", value: "#f79009ff", type: "color" },
  { name: "warning-600", displayName: "Warning 600", value: "#dc6803ff", type: "color" },
  { name: "warning-700", displayName: "Warning 700", value: "#b54708ff", type: "color" },
  { name: "warning-800", displayName: "Warning 800", value: "#93370dff", type: "color" },
  { name: "warning-900", displayName: "Warning 900", value: "#7a2e0eff", type: "color" },
  
  // Success
  { name: "success-25", displayName: "Success 25", value: "#f6fef9ff", type: "color" },
  { name: "success-50", displayName: "Success 50", value: "#ecfdf3ff", type: "color" },
  { name: "success-100", displayName: "Success 100", value: "#d1fadfff", type: "color" },
  { name: "success-200", displayName: "Success 200", value: "#a6f4c5ff", type: "color" },
  { name: "success-300", displayName: "Success 300", value: "#6ce9a6ff", type: "color" },
  { name: "success-400", displayName: "Success 400", value: "#32d583ff", type: "color" },
  { name: "success-500", displayName: "Success 500", value: "#12b76aff", type: "color" },
  { name: "success-600", displayName: "Success 600", value: "#039855ff", type: "color" },
  { name: "success-700", displayName: "Success 700", value: "#027a48ff", type: "color" },
  { name: "success-800", displayName: "Success 800", value: "#05603aff", type: "color" },
  { name: "success-900", displayName: "Success 900", value: "#054f31ff", type: "color" },


  ////////////////////
  // Secondary colors

  // Blue gray
  { name: "bluegray-25", displayName: "Bluegray 25", value: "#fcfcfdff", type: "color" },
  { name: "bluegray-50", displayName: "Bluegray 50", value: "#f8f9fcff", type: "color" },
  { name: "bluegray-100", displayName: "Bluegray 100", value: "#eaecf5ff", type: "color" },
  { name: "bluegray-200", displayName: "Bluegray 200", value: "#d5d9ebff", type: "color" },
  { name: "bluegray-300", displayName: "Bluegray 300", value: "#afb5d9ff", type: "color" },
  { name: "bluegray-400", displayName: "Bluegray 400", value: "#717bbcff", type: "color" },
  { name: "bluegray-500", displayName: "Bluegray 500", value: "#4e5ba6ff", type: "color" },
  { name: "bluegray-600", displayName: "Bluegray 600", value: "#3e4784ff", type: "color" },
  { name: "bluegray-700", displayName: "Bluegray 700", value: "#363f72ff", type: "color" },
  { name: "bluegray-800", displayName: "Bluegray 800", value: "#293056ff", type: "color" },
  { name: "bluegray-900", displayName: "Bluegray 900", value: "#101323ff", type: "color" },

  // Blue light
  { name: "blue-light-25", displayName: "Blue Light 25", value: "#f5fbffff", type: "color" },
  { name: "blue-light-50", displayName: "Blue Light 50", value: "#f0f9ffff", type: "color" },
  { name: "blue-light-100", displayName: "Blue Light 100", value: "#e0f2feff", type: "color" },
  { name: "blue-light-200", displayName: "Blue Light 200", value: "#b9e6feff", type: "color" },
  { name: "blue-light-300", displayName: "Blue Light 300", value: "#7cd4fdff", type: "color" },
  { name: "blue-light-400", displayName: "Blue Light 400", value: "#36bffaff", type: "color" },
  { name: "blue-light-500", displayName: "Blue Light 500", value: "#0ba5ecff", type: "color" },
  { name: "blue-light-600", displayName: "Blue Light 600", value: "#0086c9ff", type: "color" },
  { name: "blue-light-700", displayName: "Blue Light 700", value: "#026aa2ff", type: "color" },
  { name: "blue-light-800", displayName: "Blue Light 800", value: "#065986ff", type: "color" },
  { name: "blue-light-900", displayName: "Blue Light 900", value: "#0b4a6fff", type: "color" },

  // Blue
  { name: "blue-25", displayName: "Blue 25", value: "#f5faffff", type: "color" },
  { name: "blue-50", displayName: "Blue 50", value: "#eff8ffff", type: "color" },
  { name: "blue-100", displayName: "Blue 100", value: "#d1e9ffff", type: "color" },
  { name: "blue-200", displayName: "Blue 200", value: "#b2ddffff", type: "color" },
  { name: "blue-300", displayName: "Blue 300", value: "#84caffff", type: "color" },
  { name: "blue-400", displayName: "Blue 400", value: "#53b1fdff", type: "color" },
  { name: "blue-500", displayName: "Blue 500", value: "#2e90faff", type: "color" },
  { name: "blue-600", displayName: "Blue 600", value: "#1570efff", type: "color" },
  { name: "blue-700", displayName: "Blue 700", value: "#175cd3ff", type: "color" },
  { name: "blue-800", displayName: "Blue 800", value: "#1849a9ff", type: "color" },
  { name: "blue-900", displayName: "Blue 900", value: "#194185ff", type: "color" },

  // Indigo
  { name: "indigo-25", displayName: "Indigo 25", value: "#f5f8ffff", type: "color" },
  { name: "indigo-50", displayName: "Indigo 50", value: "#eef4ffff", type: "color" },
  { name: "indigo-100", displayName: "Indigo 100", value: "#e0eaffff", type: "color" },
  { name: "indigo-200", displayName: "Indigo 200", value: "#c7d7feff", type: "color" },
  { name: "indigo-300", displayName: "Indigo 300", value: "#a4bcfdff", type: "color" },
  { name: "indigo-400", displayName: "Indigo 400", value: "#8098f9ff", type: "color" },
  { name: "indigo-500", displayName: "Indigo 500", value: "#6172f3ff", type: "color" },
  { name: "indigo-600", displayName: "Indigo 600", value: "#444ce7ff", type: "color" },
  { name: "indigo-700", displayName: "Indigo 700", value: "#3538cdff", type: "color" },
  { name: "indigo-800", displayName: "Indigo 800", value: "#2d31a6ff", type: "color" },
  { name: "indigo-900", displayName: "Indigo 900", value: "#2d3282ff", type: "color" },

  // Purple
  { name: "purple-25", displayName: "Purple 25", value: "#fafaffff", type: "color" },
  { name: "purple-50", displayName: "Purple 50", value: "#f4f3ffff", type: "color" },
  { name: "purple-100", displayName: "Purple 100", value: "#ebe9feff", type: "color" },
  { name: "purple-200", displayName: "Purple 200", value: "#d9d6feff", type: "color" },
  { name: "purple-300", displayName: "Purple 300", value: "#bdb4feff", type: "color" },
  { name: "purple-400", displayName: "Purple 400", value: "#9b8afbff", type: "color" },
  { name: "purple-500", displayName: "Purple 500", value: "#7a5af8ff", type: "color" },
  { name: "purple-600", displayName: "Purple 600", value: "#6938efff", type: "color" },
  { name: "purple-700", displayName: "Purple 700", value: "#5925dcff", type: "color" },
  { name: "purple-800", displayName: "Purple 800", value: "#4a1fb8ff", type: "color" },
  { name: "purple-900", displayName: "Purple 900", value: "#3e1c96ff", type: "color" },

  // Pink
  { name: "pink-25", displayName: "Pink 25", value: "#fef6fbff", type: "color" },
  { name: "pink-50", displayName: "Pink 50", value: "#fdf2faff", type: "color" },
  { name: "pink-100", displayName: "Pink 100", value: "#fce7f6ff", type: "color" },
  { name: "pink-200", displayName: "Pink 200", value: "#fcceeeff", type: "color" },
  { name: "pink-300", displayName: "Pink 300", value: "#faa7e0ff", type: "color" },
  { name: "pink-400", displayName: "Pink 400", value: "#f670c7ff", type: "color" },
  { name: "pink-500", displayName: "Pink 500", value: "#ee46bcff", type: "color" },
  { name: "pink-600", displayName: "Pink 600", value: "#dd2590ff", type: "color" },
  { name: "pink-700", displayName: "Pink 700", value: "#c11574ff", type: "color" },
  { name: "pink-800", displayName: "Pink 800", value: "#9e165fff", type: "color" },
  { name: "pink-900", displayName: "Pink 900", value: "#851651ff", type: "color" },

  // Rosé
  { name: "rosé-25", displayName: "Rosé 25", value: "#fff5f6ff", type: "color" },
  { name: "rosé-50", displayName: "Rosé 50", value: "#fff1f3ff", type: "color" },
  { name: "rosé-100", displayName: "Rosé 100", value: "#ffe4e8ff", type: "color" },
  { name: "rosé-200", displayName: "Rosé 200", value: "#fecdd6ff", type: "color" },
  { name: "rosé-300", displayName: "Rosé 300", value: "#fea3b4ff", type: "color" },
  { name: "rosé-400", displayName: "Rosé 400", value: "#fd6f8eff", type: "color" },
  { name: "rosé-500", displayName: "Rosé 500", value: "#f63d68ff", type: "color" },
  { name: "rosé-600", displayName: "Rosé 600", value: "#e31b54ff", type: "color" },
  { name: "rosé-700", displayName: "Rosé 700", value: "#c01048ff", type: "color" },
  { name: "rosé-800", displayName: "Rosé 800", value: "#a11043ff", type: "color" },
  { name: "rosé-900", displayName: "Rosé 900", value: "#89123eff", type: "color" },

  // Orange
  { name: "orange-25", displayName: "Orange 25", value: "#fffaf5ff", type: "color" },
  { name: "orange-50", displayName: "Orange 50", value: "#fff6edff", type: "color" },
  { name: "orange-100", displayName: "Orange 100", value: "#ffead5ff", type: "color" },
  { name: "orange-200", displayName: "Orange 200", value: "#fddcabff", type: "color" },
  { name: "orange-300", displayName: "Orange 300", value: "#feb273ff", type: "color" },
  { name: "orange-400", displayName: "Orange 400", value: "#fd853aff", type: "color" },
  { name: "orange-500", displayName: "Orange 500", value: "#fb6514ff", type: "color" },
  { name: "orange-600", displayName: "Orange 600", value: "#ec4a0aff", type: "color" },
  { name: "orange-700", displayName: "Orange 700", value: "#c4320aff", type: "color" },
  { name: "orange-800", displayName: "Orange 800", value: "#9c2a10ff", type: "color" },
  { name: "orange-900", displayName: "Orange 900", value: "#7e2410ff", type: "color" },

  ////////////
  // Color Shades

  // Teal
  { name: "teal-50", displayName: "Teal 50", value: "#f0f5f4ff", type: "color" },
  { name: "teal-100", displayName: "Teal 100", value: "#e1eaeaff", type: "color" },
  { name: "teal-200", displayName: "Teal 200", value: "#c2d6d4ff", type: "color" },
  { name: "teal-300", displayName: "Teal 300", value: "#a4c1bfff", type: "color" },
  { name: "teal-400", displayName: "Teal 400", value: "#86aca9ff", type: "color" },
  { name: "teal-500", displayName: "Teal 500", value: "#4f7471ff", type: "color" },
  { name: "teal-600", displayName: "Teal 600", value: "#537976ff", type: "color" },
  { name: "teal-700", displayName: "Teal 700", value: "#3e5b59ff", type: "color" },
  { name: "teal-800", displayName: "Teal 800", value: "#293d3bff", type: "color" },
  { name: "teal-900", displayName: "Teal 900", value: "#151e1eff", type: "color" },
  { name: "teal-950", displayName: "Teal 950", value: "#0a0f0fff", type: "color" },
];
