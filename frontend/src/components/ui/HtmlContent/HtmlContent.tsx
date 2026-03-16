import React, { useState } from "react";
import HtmlViewer from "./HtmlViewer";
import HtmlEditor, { CustomDescendant } from "./HtmlEditor";
import type { CustomElement } from "./HtmlEditor";

export interface HtmlContentProps {
  value: CustomDescendant[];
  onChange?: (value: CustomDescendant[]) => void;
  editable?: boolean;
  tableName?: string;
  columnName?: string;
  refName?: string;
  itemId?: string;
  minHeight?: string;
  maxHeight?: string;
  maxWidth?: string;
  isAdmin?: boolean;
}

const defaultValue: CustomDescendant[] = [{ type: "paragraph", children: [{ text: "" }] }];

const HtmlContent: React.FC<HtmlContentProps> = ({ value = defaultValue, onChange, editable = false, tableName, columnName, refName, itemId, minHeight = '93vh', maxHeight = '93vh', maxWidth = '1300px', isAdmin = false }) => {
  // editable = true : on affiche le bouton "Éditer" dans le viewer
  // isEditing = true : on affiche l'éditeur
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState<CustomDescendant[]>(value);

  const handleEdit = () => isAdmin && setIsEditing(true);
  const handleClose = () => setIsEditing(false);
  const handleChange = (val: CustomDescendant[]) => {
    setLocalValue(val);
    if (onChange) onChange(val);
  };

  // Helper pour ne garder que les CustomElement (Slate ne veut pas de CustomText en racine)
  const getElementNodes = (nodes: CustomDescendant[]): CustomElement[] => {
    return nodes.filter((n): n is CustomElement => (n as any).type && Array.isArray((n as any).children));
  };

  const [showCloseModal, setShowCloseModal] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Main content (viewer or editor) */}
      <div style={{ position: 'relative' }}>
        {!isEditing && (
          <HtmlViewer
            value={localValue}
            tableName={tableName}
            columnName={columnName}
            refName={refName}
            itemId={itemId}
            minHeight={minHeight}
            maxHeight={maxHeight}
            maxWidth={maxWidth}
            onEdit={isAdmin ? () => setIsEditing(true) : undefined}
          />
        )}
        {isEditing && isAdmin && (
          <HtmlEditor
            initialValue={getElementNodes(localValue)}
            onChange={handleChange}
            tableName={tableName}
            columnName={columnName}
            refName={refName}
            itemId={itemId}
            minHeight={minHeight}
            maxHeight={maxHeight}
            maxWidth={maxWidth}
          />
        )}
        {/* Button positioned relative to main div */}
        {isAdmin && (
          <button
            type="button"
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: isEditing ? '#f44336' : '#4caf50',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1200,
              cursor: 'pointer',
            }}
            title={isEditing ? "Fermer l'éditeur" : "Éditer le contenu"}
            onClick={() => {
              if (isEditing) setShowCloseModal(true);
              else {
                setShowCloseModal(false); // Reset modal state when entering edit mode
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (
              // SVG close icon
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="none" />
                <path d="M7 7L17 17M17 7L7 17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              // SVG pencil icon
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="none" />
                <path d="M4 17.25V20h2.75l8.13-8.13-2.75-2.75L4 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.76 3.76 1.83-1.83z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>
      {/* Confirmation modal for close */}
      {isEditing && showCloseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', padding: 32, minWidth: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Souhaitez-vous quitter l'éditeur ?</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button onClick={handleClose} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Oui</button>
              <button onClick={() => setShowCloseModal(false)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Non</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlContent;
