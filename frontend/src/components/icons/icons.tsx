// icons.tsx
import React from "react";

interface IconProps {
  color?: string;
}

export const EyeIcon: React.FC<IconProps> = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <title>Icône d'œil</title>
    <path d="M1 12 s4 -8 11 -8 11 8 11 8 -4 8 -11 8 -11 -8 -11 -8 z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ViewIcon: React.FC<IconProps> = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <title>Icône de vue</title>
    <path d="M1 12 s4 -8 11 -8 11 8 11 8 -4 8 -11 8 -11 -8 z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <title>Chevron vers le haut</title>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <title>Chevron vers le bas</title>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps & { className?: string }> = ({ color = "currentColor", className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <title>Téléchargement</title>
    {/* Flèche vers le bas, au-dessus du rectangle */}
    <line x1="12" y1="3" x2="12" y2="13" />
    <polyline points="8 9 12 13 16 9" />
    {/* Rectangle avec coins arrondis et espace sous la flèche */}
    <rect x="6" y="16" width="12" height="5" rx="2" ry="2" />
  </svg>
);

