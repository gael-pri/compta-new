// ---- HTML to Slate Parser ----
function htmlToSlate(html: string): CustomDescendant[] {
  const div = document.createElement("div");
  div.innerHTML = html;
  const parseNode = (node: Node): CustomDescendant | null => {
    if (node.nodeType === 3) {
      // Text node
      return { text: node.textContent || "" } as CustomText;
    }
    if (node.nodeType !== 1) return null;
    const el = node as HTMLElement;
  const children = Array.from(el.childNodes).map(parseNode).filter(Boolean) as CustomDescendant[];
    switch (el.tagName) {
      case "P":
        return { type: "paragraph", children };
      case "H1":
        return { type: "heading-1", children };
      case "H2":
        return { type: "heading-2", children };
      case "H3":
        return { type: "heading-3", children };
      case "H4":
        return { type: "heading-4", children };
      case "H5":
        return { type: "heading-5", children };
      case "UL":
        return { type: "bulleted-list", children };
      case "OL":
        return { type: "numbered-list", children };
      case "LI":
        return { type: "list-item", children };
      case "BLOCKQUOTE":
        return { type: "blockquote-info", children };
      case "HR":
        return { type: "hr", children: [{ text: "" }] };
      case "CODE":
        return { text: el.textContent || "", code: true };
      case "B":
      case "STRONG":
        return { text: el.textContent || "", bold: true };
      case "I":
      case "EM":
        return { text: el.textContent || "", italic: true };
      case "U":
        return { text: el.textContent || "", underline: true };
      case "A":
        return { type: "link", url: el.getAttribute("href") || "", children };
      case "TABLE": {
        // Only direct <tr> children
        const rows = Array.from(el.children)
          .filter(child => child.nodeType === 1 && (child as HTMLElement).tagName === "TR")
          .map(tr => parseNode(tr)).filter(Boolean) as CustomDescendant[];
        return { type: "table", children: rows };
      }
      case "TR": {
        // For <tr>, merge <p> children into previous <td> (handles <p> between <td>)
        const cells: CustomDescendant[] = [];
        let pendingPChildren: CustomDescendant[] = [];
        Array.from(el.children).forEach(child => {
          if (child.nodeType === 1) {
            const tag = (child as HTMLElement).tagName;
            if (tag === "P") {
              // Parse children of <p> and collect them
              const parsed = Array.from(child.childNodes).map(parseNode).filter(Boolean) as CustomDescendant[];
              pendingPChildren.push(...parsed);
            } else if (tag === "TD") {
              const tdContent = parseNode(child);
              if (tdContent) {
                // If there are pending <p> children, merge them into this <td>
                if (pendingPChildren.length && typeof tdContent === 'object' && 'children' in tdContent) {
                  tdContent.children = [...tdContent.children, ...pendingPChildren];
                  pendingPChildren = [];
                }
                cells.push(tdContent);
              }
            }
            // Ignore all other tags
          }
        });
        return { type: "table-row", children: cells };
      }
      case "TD":
        return { type: "table-cell", children };
      case "IMG":
        return { type: "image", url: el.getAttribute("src") || "", alt: el.getAttribute("alt") || "image", children: [{ text: "" }] };
      default:
  // Fallback: parse all children (not just first)
  if (children.length) return children[0];
  return { text: el.textContent || "" };
    }
  };
  const result: CustomDescendant[] = [];
  div.childNodes.forEach(node => {
    const parsed = parseNode(node);
    if (Array.isArray(parsed)) {
      result.push(...parsed);
    } else if (parsed) {
      result.push(parsed);
    }
  });
  return result.length ? result : [{ type: "paragraph", children: [{ text: "" }] }];
}
declare global {
  interface Window {
    __saveHtmlEditorContent?: () => void;
    __showCancelModal?: () => void;
  }
}
import { Range, Element as SlateElement, Text as SlateText, Descendant } from "slate";
import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { createEditor, Editor, Transforms, Path } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";

import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl } from "react-icons/fa";
import { FaStrikethrough } from "react-icons/fa";
import { IoCode } from "react-icons/io5";
import { AiOutlineLink } from "react-icons/ai";
import { MdAddCircleOutline } from "react-icons/md";
import { LiaParagraphSolid } from "react-icons/lia";
import { BsImageAlt } from "react-icons/bs";
import { BsImage } from "react-icons/bs";
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4, LuHeading5, LuFileCode2, LuEye } from "react-icons/lu";
import { BiTable } from "react-icons/bi";
import { RiDoubleQuotesL } from "react-icons/ri";
import styles from "./HtmlContent.module.css";
//import { supabase } from "@lib/supabaseClient";

// ---- Types ----
export interface CustomElement extends SlateElement {
  type:
    | "paragraph"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "heading-5"
    | "bulleted-list"
    | "numbered-list"
    | "list-item"
    | "blockquote-info"
    | "blockquote-success"
    | "blockquote-warning"
    | "blockquote-error"
    | "hr"
    | "link"
    | "table"
    | "table-row"
    | "table-cell"
    | "image"
    | "code-block";
  url?: string;
  alt?: string;
  children: CustomDescendant[];
}

export interface CustomText extends SlateText {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

export type CustomDescendant = CustomElement | CustomText;

// ---- Toolbar ----
type ToolbarButtonProps = {
  format: string;
  icon: React.ReactNode;
  onClick: (format: string) => void;
};
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ format, icon, onClick }) => (
  <button
    type="button"
    onMouseDown={(event) => {
      event.preventDefault();
      onClick(format);
    }}
    style={{ marginRight: 8, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
  >
    {icon}
  </button>
);

type ToolbarProps = {
  onFormat: (format: string) => void;
  onBlock: (format: string, file?: File) => void;
  onToggleHtml: () => void;
};
const Toolbar: React.FC<ToolbarProps> = ({ onFormat, onBlock, onToggleHtml }) => (
  <div className={styles.toolbarSticky} style={{ borderBottom: "1px solid #ddd", marginBottom: 8, paddingBottom: 4, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
    {[<LuHeading1 style={{ fontSize: 24 }} />, <LuHeading2 style={{ fontSize: 22 }} />, <LuHeading3 style={{ fontSize: 20 }} />, <LuHeading4 style={{ fontSize: 18 }} />, <LuHeading5 style={{ fontSize: 16 }} />].map((Icon, idx) => (
      <ToolbarButton key={idx + 1} format={`heading-${idx + 1}`} icon={Icon} onClick={() => onBlock(`heading-${idx + 1}`)} />
    ))}
    <ToolbarButton format="paragraph" icon={<LiaParagraphSolid style={{ fontSize: 16 }} />} onClick={() => onBlock("paragraph")} />
    <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 8px" }} />
    <ToolbarButton format="bold" icon={<FaBold style={{ fontSize: 16 }} />} onClick={onFormat} />
    <ToolbarButton format="italic" icon={<FaItalic style={{ fontSize: 16 }} />} onClick={onFormat} />
    <ToolbarButton format="underline" icon={<FaUnderline style={{ fontSize: 16 }} />} onClick={onFormat} />
    <ToolbarButton format="strikethrough" icon={<FaStrikethrough style={{ fontSize: 16 }} />} onClick={onFormat} />
    <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 8px" }} />
    <ToolbarButton format="bulleted-list" icon={<FaListUl />} onClick={() => onBlock("bulleted-list")} />
    <ToolbarButton format="numbered-list" icon={<FaListOl />} onClick={() => onBlock("numbered-list")} />
    <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 8px" }} />
    <ToolbarButton format="blockquote-info" icon={<RiDoubleQuotesL style={{ color: "#2196f3" }} />} onClick={() => onBlock("blockquote-info")} />
    <ToolbarButton format="blockquote-success" icon={<RiDoubleQuotesL style={{ color: "#4caf50" }} />} onClick={() => onBlock("blockquote-success")} />
    <ToolbarButton format="blockquote-warning" icon={<RiDoubleQuotesL style={{ color: "#ff9800" }} />} onClick={() => onBlock("blockquote-warning")} />
    <ToolbarButton format="blockquote-error" icon={<RiDoubleQuotesL style={{ color: "#f44336" }} />} onClick={() => onBlock("blockquote-error")} />
    <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 8px" }} />
    <ToolbarButton format="link" icon={<AiOutlineLink style={{ fontSize: 22 }} />} onClick={() => onBlock("link")} />
    <ToolbarButton format="code" icon={<IoCode style={{ fontSize: 20 }} />} onClick={onFormat} />
    <ToolbarButton format="code-block" icon={<LuFileCode2 style={{ fontSize: 20 }} />} onClick={() => onBlock("code-block")} />
    {/* Image button with file input */}
    <label style={{ marginRight: 8, cursor: 'pointer' }}>
      <BsImage style={{ fontSize: 20, color: '#4caf50' }} />
      <input type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onBlock("image", file);
        }} />
    </label>
    <ToolbarButton format="image" icon={<BsImageAlt style={{ fontSize: 18, color: '#ff9800' }} />} onClick={() => onBlock("image")} />
    <ToolbarButton format="table" icon={<BiTable style={{ fontSize: 24, color: "#2196f3" }} />} onClick={() => onBlock("table")} />
    <ToolbarButton format="hr" icon={<span style={{fontSize:20, fontWeight:'bold'}}>―</span>} onClick={() => onBlock("hr")} />
    <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 8px" }} />

    {/* Boutons Annuler et Enregistrer avec icônes */}
    <button
      type="button"
      style={{ marginLeft: 8, background: "none", border: "none", color: "#333", display: "flex", alignItems: "center", fontWeight: 500, fontSize: 16, cursor: "pointer", padding: "4px 10px" }}
      onClick={() => typeof window !== "undefined" && window.__showCancelModal && window.__showCancelModal()}
    >
      <span style={{ display: "flex", alignItems: "center", marginRight: 6 }}>
        {/* Croix rouge */}
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: "middle" }}>
          <path d="M6 6L14 14M14 6L6 14" stroke="#f44336" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      Annuler
    </button>
    <button
      type="button"
      style={{ marginLeft: 8, background: "none", border: "none", color: "#1976d2", display: "flex", alignItems: "center", fontWeight: 500, fontSize: 16, cursor: "pointer", padding: "4px 10px" }}
      onClick={typeof window !== "undefined" ? (window.__saveHtmlEditorContent || undefined) : undefined}
      id="html-editor-save-btn"
    >
      <span style={{ display: "flex", alignItems: "center", marginRight: 6 }}>
        {/* Check verte */}
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: "middle" }}>
          <path d="M5 11L9 15L15 7" stroke="#4caf50" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      Enregistrer
    </button>
    <div style={{ flex: 1 }} />
    <button type="button" onClick={onToggleHtml} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontSize: 20 }} title="Afficher le code HTML">
      <LuEye />
    </button>
  </div>
);

// ---- Helpers ----
const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as CustomElement).type === format,
  });
  return !!match;
};

const toggleBlock = (editor: Editor, format: string) => {
  if (format === "table") {
    // Insère un tableau 2x2 par défaut
    const table = {
      type: "table",
      children: [
        {
          type: "table-row",
          children: [
            { type: "table-cell", children: [{ text: "" }] },
            { type: "table-cell", children: [{ text: "" }] }
          ]
        },
        {
          type: "table-row",
          children: [
            { type: "table-cell", children: [{ text: "" }] },
            { type: "table-cell", children: [{ text: "" }] }
          ]
        }
      ]
    };
    Transforms.insertNodes(editor, table as SlateElement);
    return;
  }
  if (format === "image") {
    const url = window.prompt("URL de l'image à insérer :");
    if (url) {
      Transforms.insertNodes(editor, { type: "image", url, children: [{ text: "" }] } as SlateElement);
    }
    return;
  }
  const isActive = isBlockActive(editor, format);
  if (format === "bulleted-list" || format === "numbered-list") {
    Transforms.setNodes(editor, { type: "list-item" } as Partial<SlateElement>, { match: (n) => SlateElement.isElement(n) });
    Transforms.wrapNodes(editor, { type: format, children: [] } as SlateElement, {
      match: (n) => SlateElement.isElement(n) && (n as CustomElement).type === "list-item",
    });
  } else if (format.startsWith("blockquote")) {
    // Regroupe tous les blocs sélectionnés dans un seul blockquote
    Transforms.wrapNodes(editor, { type: format, children: [] } as SlateElement, {
      match: (n) => SlateElement.isElement(n) && [
        "paragraph",
        "heading-1",
        "heading-2",
        "heading-3",
        "heading-4",
        "heading-5",
        "bulleted-list",
        "numbered-list",
        "list-item",
        "code-block",
        "link"
      ].includes((n as CustomElement).type),
      split: false
    });
  } else if (format === "code-block") {
    // Multi-line selection: each line becomes a line in the code-block (separated by \n)
    const { selection } = editor;
    if (selection) {
      const selectedTexts: string[] = [];
      for (const [, path] of Editor.nodes(editor, {
        at: selection,
        match: n => SlateElement.isElement(n) && ["paragraph", "list-item"].includes((n as CustomElement).type)
      })) {
        selectedTexts.push(Editor.string(editor, path));
      }
      if (selectedTexts.length > 0) {
        // Remove selected nodes
        Transforms.delete(editor, { at: selection });
        // Insert code-block with lines
        Transforms.insertNodes(editor, {
          type: "code-block",
          children: [{ text: selectedTexts.join("\n") }]
        } as SlateElement);
        return;
      }
    }
    // Fallback: wrap as before
    Transforms.wrapNodes(editor, { type: "code-block", children: [] } as SlateElement, {
      match: (n) => SlateElement.isElement(n) && ["paragraph", "list-item"].includes((n as CustomElement).type),
      split: false
    });
  } else if (format === "hr") {
    Transforms.insertNodes(editor, { type: "hr", children: [{ text: "" }] } as SlateElement);
  } else {
    Transforms.setNodes(editor, { type: isActive ? "paragraph" : format } as Partial<SlateElement>, { match: (n) => SlateElement.isElement(n) });
  }
};

const insertLink = (editor: Editor) => {
  const url = window.prompt("Entrez l’URL du lien:");
  if (!url) return;
  Transforms.insertNodes(editor, { type: "link", url, children: [{ text: "Lien" }] } as SlateElement);
};

// ---- HtmlEditor ----
type HtmlEditorProps = {
  initialValue?: CustomElement[]; // Désactivé, Slate moderne n'utilise que value
  onChange?: (value: CustomDescendant[]) => void;
  tableName?: string;
  columnName?: string;
  refName?: string;
  itemId?: string | number;
  onClose?: () => void; // callback to notify parent to close editor
  minHeight?: string;
  maxHeight?: string;
  maxWidth?: string;
};
const HtmlEditor: React.FC<HtmlEditorProps> = ({
  initialValue = [{ type: "paragraph", children: [{ text: "" }] }], // Désactivé
  onChange,
  tableName,
  columnName,
  refName,
  itemId,
  onClose,
  minHeight = '93vh',
  maxHeight = '93vh',
  maxWidth = '1300px',
}) => {
  // Remove isEditing state, rely on parent to unmount editor via onClose
  // Sauvegarde automatique à chaque modification réelle (hors sélection)
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const defaultValue: CustomDescendant[] = [{ type: "paragraph", children: [{ text: "" }] }];
  const [value, setValue] = useState<CustomDescendant[]>(defaultValue);
  const [showHtml, setShowHtml] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalValue, setOriginalValue] = useState<CustomDescendant[]>(defaultValue);
  const [toast, setToast] = useState<string | null>(null);

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue as CustomDescendant[]);
    if (typeof window !== "undefined" && editor) {
      const isAstChange = editor.operations.some((op: any) => op.type !== 'set_selection');
      if (isAstChange && tableName && columnName && refName && itemId) {
        setTimeout(() => {
          const json = JSON.stringify(newValue);
          // supabase
          //   .from(tableName)
          //   .update({ [columnName]: json })
          //   .eq(refName, itemId);
        }, 0);
      }
    }
    if (onChange) onChange(newValue as CustomDescendant[]);
  }, [editor, tableName, columnName, refName, itemId, onChange]);

  // Fonction pour charger le contenu depuis Supabase
  const fetchContent = async () => {
    if (!tableName || !columnName || !refName || !itemId) return;
    setLoading(true);
    const { data, error } = {data: null, error: null} //await supabase
      // .from(tableName)
      // .select(columnName)
      // .eq(refName, itemId)
      // .limit(1);
    setLoading(false);
    const typedData = data as Array<{ [key: string]: any }> | null;
    let content = typedData && typedData[0] ? typedData[0][columnName] : null;
    // Si le contenu est une chaîne HTML, convertir
    if (content && typeof content === "string" && content.trim().startsWith("<")) {
      const slateValue = htmlToSlate(content);
      setValue(slateValue);
      setOriginalValue(slateValue);
    } else if (content && typeof content === "string") {
      // Si le contenu est une chaîne JSON
      try {
        const slateValue = JSON.parse(content);
        setValue(Array.isArray(slateValue) ? slateValue : defaultValue);
        setOriginalValue(Array.isArray(slateValue) ? slateValue : defaultValue);
      } catch {
        setValue(defaultValue);
        setOriginalValue(defaultValue);
      }
    } else if (Array.isArray(content)) {
      setValue(content);
      setOriginalValue(content);
    } else {
      setValue(defaultValue);
      setOriginalValue(defaultValue);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, columnName, refName, itemId]);

  // Expose la fonction pour ouvrir la modal d'annulation
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__showCancelModal = () => setShowCancelModal(true);
    }
  }, []);

  // Fonction pour annuler et recharger le contenu original
  const handleCancel = () => {
  setValue(originalValue);
  setShowCancelModal(false);
  // Use setTimeout to ensure modal closes before parent unmounts
  if (typeof onClose === 'function') setTimeout(onClose, 0);
  };

  // Action Enregistrer
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__saveHtmlEditorContent = async () => {
        if (!tableName || !columnName || !refName || !itemId) {
          setToast("Configuration Supabase incomplète");
          setTimeout(() => setToast(null), 3000);
          return;
        }
        const json = JSON.stringify(value);
        const { error, data } = {data: null, error: null} // await supabase
          // .from(tableName)
          // .update({ [columnName]: json })
          // .eq(refName, itemId)
          // .select();
        // if (error) {
        //   setToast("Erreur lors de l'enregistrement : " + error.message);
        //   setTimeout(() => setToast(null), 3000);
        // } else if (!data || data.length === 0) {
        //   setToast("Aucune ligne modifiée. Vérifiez que l'ID existe dans la table.");
        //   setTimeout(() => setToast(null), 3000);
        // } else {
        //   setToast("Contenu enregistré !");
        //   setTimeout(() => {
        //     setToast(null);
        //     if (typeof onClose === 'function') onClose();
        //   }, 3000);
        // }
      };
    }
  }, [tableName, columnName, refName, itemId, value, onClose]);

  const toggleFormat = useCallback((format: string) => {
    const marks = Editor.marks(editor);
    if (marks && (marks as any)[format]) editor.removeMark(format);
    else editor.addMark(format, true);
  }, [editor]);

  const handleBlock = useCallback((format: string, file?: File) => {
    if (format === "link") insertLink(editor);
    else if (format === "image" && file) {
      // Image locale
      const url = URL.createObjectURL(file);
      Transforms.insertNodes(editor, { type: "image", url, children: [{ text: "" }] } as SlateElement);
    } else toggleBlock(editor, format);
  }, [editor]);

  const renderElement = useCallback(({ element, attributes, children }: any) => {
    const type = (element as CustomElement).type;
    switch (type) {
      case "image":
        return (
          <div style={{ textAlign: "center", margin: "1em 0" }} {...attributes}>
            <img src={(element as any).url} alt={(element as any).alt || "image"} style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }} />
            {children}
          </div>
        );
      case "table": {
        const path = ReactEditor.findPath(editor, element);
        const [showMenu, setShowMenu] = useState(false);
        const wrapperRef = useRef<HTMLDivElement>(null);
        // Menu toggle
        const handleMenuToggle = (e: React.MouseEvent) => {
          e.stopPropagation();
          setShowMenu((v) => !v);
        };
        // Ferme le menu si clic en dehors
        useEffect(() => {
          if (!showMenu) return;
          const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setShowMenu(false);
            }
          };
          document.addEventListener('mousedown', handleClickOutside);
          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };
        }, [showMenu]);
        const addRow = () => {
          const row = {
            type: "table-row",
            children: element.children[0]?.children.map(() => ({ type: "table-cell", children: [{ text: "" }] })) || [ { type: "table-cell", children: [{ text: "" }] } ]
          };
          Transforms.insertNodes(editor, row as SlateElement, { at: path.concat([element.children.length]) });
        };
        const removeRow = () => {
          if (element.children.length > 1) {
            Transforms.removeNodes(editor, { at: path.concat([element.children.length - 1]) });
          }
        };
        const addCol = () => {
          element.children.forEach((row: any, rIdx: number) => {
            const cellPath = path.concat([rIdx, row.children.length]);
            Transforms.insertNodes(editor, { type: "table-cell", children: [{ text: "" }] } as SlateElement, { at: cellPath });
          });
        };
        const removeCol = () => {
          if (element.children[0]?.children.length > 1) {
            element.children.forEach((row: any, rIdx: number) => {
              const cellPath = path.concat([rIdx, row.children.length - 1]);
              Transforms.removeNodes(editor, { at: cellPath });
            });
          }
        };
        return (
          <div ref={wrapperRef} className={styles.tableWrapper} style={{ display: 'inline-block', margin: '0.5em 0' }}>
            <button type="button" className={styles.tablePlusBtn} onClick={handleMenuToggle}>
              <MdAddCircleOutline style={{ fontSize: 22, color: '#2196f3' }} />
            </button>
            {showMenu && (
              <div
                style={{ position: 'absolute', top: 10, left: 0, zIndex: 3, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}
                onMouseLeave={() => setShowMenu(false)}
              >
                <button type="button" onClick={addRow} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer' }}>+ ligne</button>
                <button type="button" onClick={removeRow} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer' }}>– ligne</button>
                <button type="button" onClick={addCol} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer' }}>+ colonne</button>
                <button type="button" onClick={removeCol} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer' }}>– colonne</button>
              </div>
            )}
            <table className={styles.table} {...attributes}><tbody>{children}</tbody></table>
          </div>
        );
      }
      case "table-row":
        return (<tr {...attributes}>{children}</tr>);
      case "table-cell": {
        // Calcul des classes de radius pour les coins du tableau
        let cellClass = styles.tableCell;
        // On récupère la position de la cellule dans la ligne et du row dans le tableau
        let rowIdx = -1, cellIdx = -1, rowCount = 0, cellCount = 0;
        const rowParent = (attributes['data-slate-row'] !== undefined) ? attributes['data-slate-row'] : null;
        const cellParent = (attributes['data-slate-cell'] !== undefined) ? attributes['data-slate-cell'] : null;
        // On tente de retrouver la position via le parent React
        if (element && element.parent && Array.isArray(element.parent.children)) {
          const tableRows = element.parent.parent?.children;
          if (tableRows) {
            rowCount = tableRows.length;
            cellCount = element.parent.children.length;
            rowIdx = tableRows.indexOf(element.parent);
            cellIdx = element.parent.children.indexOf(element);
          }
        }
        // Ajout des classes d'angle
        if (rowIdx === 0 && cellIdx === 0) cellClass += ' ' + styles.tableCellRadiusTopLeft;
        if (rowIdx === 0 && cellIdx === cellCount - 1) cellClass += ' ' + styles.tableCellRadiusTopRight;
        if (rowIdx === rowCount - 1 && cellIdx === 0) cellClass += ' ' + styles.tableCellRadiusBottomLeft;
        if (rowIdx === rowCount - 1 && cellIdx === cellCount - 1) cellClass += ' ' + styles.tableCellRadiusBottomRight;
        return (<td className={cellClass} {...attributes}>{children}</td>);
      }
      case "bulleted-list":
        return (<ul className={styles.list} {...attributes}>{children}</ul>);
      case "numbered-list":
        return (<ol className={styles.list} {...attributes}>{children}</ol>);
      case "list-item":
        return (<li className={styles.listItem} {...attributes}>{children}</li>);
      case "heading-1":
        return (<h1 className={styles.heading1} {...attributes}>{children}</h1>);
      case "heading-2":
        return (<h2 className={styles.heading2} {...attributes}>{children}</h2>);
      case "heading-3":
        return (<h3 className={styles.heading3} {...attributes}>{children}</h3>);
      case "heading-4":
        return (<h4 className={styles.heading4} {...attributes}>{children}</h4>);
      case "heading-5":
        return (<h5 className={styles.heading5} {...attributes}>{children}</h5>);
      case "code-block":
        return (
          <pre className={styles.codeBlock} {...attributes}>
            <code>{children}</code>
          </pre>
        );
      case "hr":
        return (<hr className={styles.hr} {...attributes} />);
      case "blockquote-info":
      case "blockquote-success":
      case "blockquote-warning":
      case "blockquote-error": {
        // Blockquote peut contenir n'importe quel bloc
        const blockType = type.split('-')[1];
        const blockClass = styles[`blockquote${blockType.charAt(0).toUpperCase() + blockType.slice(1)}`];
        return (<blockquote className={blockClass} {...attributes}>{children}</blockquote>);
      }
      case "link":
        return (<a className={styles.link} {...attributes} href={(element as any).url}>{children}</a>);
      default:
        return (<p className={styles.paragraph} {...attributes}>{children}</p>);
    }
  }, []);

  const renderLeaf = useCallback(({ children, leaf, attributes }: any) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.strikethrough) children = <span style={{ textDecoration: "line-through" }}>{children}</span>;
  if (leaf.code) children = <code style={{ background: "#eee", padding: "4px", borderRadius: 3 }}>{children}</code>;
    return <span {...attributes}>{children}</span>;
  }, []);


  // ---- KeyDown ----
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Sortie de liste après deux Entrées consécutives dans un item vide
    if (event.key === "Enter" && editor.selection) {
      const { selection } = editor;
      if (Range.isCollapsed(selection)) {
        // Si on est dans un texte inline code, Enter crée un paragraphe
        const marks = Editor.marks(editor);
  if (marks && (marks as CustomText).code) {
          event.preventDefault();
          editor.removeMark("code");
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement);
          // Place le curseur dans le nouveau paragraphe
          const { selection: sel } = editor;
          if (sel && sel.anchor) {
            const [node, path] = Editor.node(editor, sel.anchor.path);
            Transforms.select(editor, {
              anchor: { path, offset: 0 },
              focus: { path, offset: 0 }
            });
          }
          return;
        }
        // Sortie de liste : transforme l'item en paragraphe puis le déplace hors de la liste
        const listItemEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "list-item" });
        if (listItemEntry) {
          const [listItemNode, listItemPath] = listItemEntry;
          // Vérifie si l'item courant est vide
          if (Editor.string(editor, listItemPath) === "") {
            // Vérifie si le node précédent est aussi un item vide
            if (listItemPath[listItemPath.length - 1] > 0) {
              const prevPath = Path.previous(listItemPath);
              const [prevNode] = Editor.node(editor, prevPath);
              if (SlateElement.isElement(prevNode) && (prevNode as CustomElement).type === "list-item" && Editor.string(editor, prevPath) === "") {
                event.preventDefault();
                // On sort de la liste : transforme l'item en paragraphe puis le déplace hors de la liste
                Transforms.setNodes(editor, { type: "paragraph" } as Partial<SlateElement>, { at: listItemPath });
                // Trouve le parent liste
                const listEntry = Editor.above(editor, { at: listItemPath, match: n => SlateElement.isElement(n) && ["bulleted-list", "numbered-list"].includes((n as CustomElement).type) });
                if (listEntry) {
                  const [listNode, listPath] = listEntry;
                  // Déplace le paragraphe juste après la liste
                  Transforms.moveNodes(editor, {
                    at: listItemPath,
                    to: Path.next(listPath)
                  });
                  // Place le curseur dans le nouveau paragraphe
                  Transforms.select(editor, {
                    anchor: { path: Path.next(listPath).concat([0]), offset: 0 },
                    focus: { path: Path.next(listPath).concat([0]), offset: 0 }
                  });
                }
                return;
              }
            }
          }
        }
      }
    }
    // Entrée sur une image : insère un paragraphe vide en dessous
    if (event.key === "Enter" && editor.selection) {
      const { selection } = editor;
      if (Range.isCollapsed(selection)) {
        const imageEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "image" });
        if (imageEntry) {
          const [imageNode, imagePath] = imageEntry;
          event.preventDefault();
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: Path.next(imagePath) });
          Transforms.select(editor, {
            anchor: { path: Path.next(imagePath).concat([0]), offset: 0 },
            focus: { path: Path.next(imagePath).concat([0]), offset: 0 }
          });
          return;
        }
      }
    }
    // Sortie du tableau si le curseur est à la fin de la dernière cellule (en bas à droite)
    if (event.key === "Enter" && editor.selection) {
      const { selection } = editor;
      if (Range.isCollapsed(selection)) {
        const cellEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "table-cell" });
        if (cellEntry) {
          const [cellNode, cellPath] = cellEntry;
          // Trouve le tableau parent
          const tableEntry = Editor.above(editor, { at: cellPath, match: n => SlateElement.isElement(n) && (n as CustomElement).type === "table" });
          if (tableEntry) {
            const [tableNode, tablePath] = tableEntry;
            // Indices de la cellule et de la ligne
            const rowIdx = cellPath[cellPath.length - 2];
            const cellIdx = cellPath[cellPath.length - 1];
            const lastRowIdx = tableNode.children.length - 1;
            const lastRow = tableNode.children[lastRowIdx] as SlateElement;
            const lastCellIdx = lastRow.children.length - 1;
            // Vérifie si on est dans la dernière cellule
            if (rowIdx === lastRowIdx && cellIdx === lastCellIdx) {
              // Vérifie si le curseur est à la fin du texte
              const cellText = Editor.string(editor, cellPath);
              if (selection.anchor.offset === cellText.length) {
                const lines = cellText.split("\n");
                if (lines.length >= 2 && lines[lines.length - 1] === "" && lines[lines.length - 2] === "") {
                  event.preventDefault();
                  Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: Path.next(tablePath) });
                  Transforms.select(editor, {
                    anchor: { path: Path.next(tablePath).concat([0]), offset: 0 },
                    focus: { path: Path.next(tablePath).concat([0]), offset: 0 }
                  });
                  return;
                }
                // Sinon, insérer un retour à la ligne
                event.preventDefault();
                editor.insertText("\n");
                return;
              }
            }
          }
        }
      }
    }
    // Sortie du tableau avec Entrée si le curseur est juste après le tableau
    if (event.key === "Enter" && editor.selection) {
      const { selection } = editor;
      if (Range.isCollapsed(selection)) {
        const [currentNode, currentPath] = Editor.node(editor, selection.anchor.path);
        // Si le node courant est un paragraphe vide
        if (SlateElement.isElement(currentNode) && (currentNode as any).type === "paragraph" && Editor.string(editor, currentPath) === "") {
          // On vérifie si le node précédent est un tableau
          if (currentPath.length > 0) {
            const prevPath = [...currentPath];
            prevPath[prevPath.length - 1] = prevPath[prevPath.length - 1] - 1;
            if (prevPath[prevPath.length - 1] >= 0) {
              const [prevNode] = Editor.node(editor, prevPath);
              if (SlateElement.isElement(prevNode) && (prevNode as any).type === "table") {
                event.preventDefault();
                // Insère un paragraphe vide après le tableau
                Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: Path.next(prevPath) });
                // Place le curseur dans le nouveau paragraphe
                Transforms.select(editor, {
                  anchor: { path: Path.next(prevPath).concat([0]), offset: 0 },
                  focus: { path: Path.next(prevPath).concat([0]), offset: 0 }
                });
                return;
              }
            }
          }
        }
      }
    }
    // Gestion Enter dans une cellule de tableau : insère un saut de ligne au lieu d'ajouter une cellule
    // Shift+Enter dans un paragraphe ou une cellule : insère un saut de ligne sans changer de bloc
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      editor.insertText("\n");
      return;
    }
    const cellEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "table-cell" });
    if (cellEntry && event.key === "Enter") {
      event.preventDefault();
      editor.insertText("\n");
      return;
    }
    // Gestion du code-block : Enter ajoute un retour à la ligne, deux retours vides sortent du bloc, Backspace vide supprime le bloc
    const codeBlockEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "code-block" });
    if (codeBlockEntry) {
      const [codeBlockNode, codeBlockPath] = codeBlockEntry;
      // Enter
      if (event.key === "Enter") {
        event.preventDefault();
        // Insert a line break at the cursor position in the code-block
        editor.insertText("\n");
        // Check if last two lines are empty to exit code-block
        const text = Editor.string(editor, codeBlockPath);
        const lines = text.split("\n");
        if (lines.length >= 2 && lines[lines.length - 1] === "" && lines[lines.length - 2] === "") {
          // Insère un paragraphe vide juste après le bloc code
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: Path.next(codeBlockPath) });
          // Place le curseur dans le nouveau paragraphe
          Transforms.select(editor, {
            anchor: { path: Path.next(codeBlockPath).concat([0]), offset: 0 },
            focus: { path: Path.next(codeBlockPath).concat([0]), offset: 0 }
          });
          // Supprime le code-block si vide
          setTimeout(() => {
            const newText = Editor.string(editor, codeBlockPath);
            if (newText === "") {
              Transforms.removeNodes(editor, { at: codeBlockPath });
            }
          }, 0);
        }
        return;
      }
      // Backspace : supprime le bloc si vide
      if (event.key === "Backspace") {
        const text = Editor.string(editor, codeBlockPath);
        if (text === "") {
          event.preventDefault();
          Transforms.removeNodes(editor, { at: codeBlockPath });
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: codeBlockPath });
          Transforms.select(editor, {
            anchor: { path: codeBlockPath.concat([0]), offset: 0 },
            focus: { path: codeBlockPath.concat([0]), offset: 0 }
          });
          return;
        }
      }
    }
    // Suppression des blockquotes et listes vides avec Backspace
    if (event.key === "Backspace") {
      // Blockquote
      const blockquoteEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type.startsWith("blockquote") });
      if (blockquoteEntry) {
        const [blockquoteNode, blockquotePath] = blockquoteEntry;
        if (
          blockquoteNode.children.length === 1 &&
          SlateElement.isElement(blockquoteNode.children[0]) &&
          Editor.string(editor, blockquotePath.concat([0])) === ""
        ) {
          event.preventDefault();
          Transforms.removeNodes(editor, { at: blockquotePath });
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: blockquotePath });
          Transforms.select(editor, {
            anchor: { path: blockquotePath.concat([0]), offset: 0 },
            focus: { path: blockquotePath.concat([0]), offset: 0 }
          });
          return;
        }
      }
      // Listes
      const listEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && ["bulleted-list", "numbered-list"].includes((n as CustomElement).type) });
      if (listEntry) {
        const [listNode, listPath] = listEntry;
        // Vérifie si la liste ne contient qu'un item vide
        if (
          listNode.children.length === 1 &&
          SlateElement.isElement(listNode.children[0]) &&
          (listNode.children[0] as CustomElement).type === "list-item" &&
          Editor.string(editor, listPath.concat([0])) === ""
        ) {
          event.preventDefault();
          Transforms.removeNodes(editor, { at: listPath });
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: listPath });
          Transforms.select(editor, {
            anchor: { path: listPath.concat([0]), offset: 0 },
            focus: { path: listPath.concat([0]), offset: 0 }
          });
          return;
        }
      }
    }
    const { selection } = editor;
    if (!selection || !ReactEditor.isFocused(editor)) return;

    // Trouve le blockquote et le paragraphe courant
    const blockquoteEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type.startsWith("blockquote") });
    const paragraphEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "paragraph" });
    if (!blockquoteEntry || !paragraphEntry) return;
    const [blockquoteNode, blockquotePath] = blockquoteEntry;
    const [paragraphNode, paragraphPath] = paragraphEntry;
    const type = (blockquoteNode as CustomElement).type;

    // Blockquote multiline
    if (event.key === "Enter" && type.startsWith("blockquote")) {
      event.preventDefault();
      // Split le paragraphe courant (multi-ligne dans le blockquote)
      Transforms.splitNodes(editor, { at: selection, always: true });

      // Après le split, vérifier si deux paragraphes vides consécutifs sont présents pour sortir du blockquote
      setTimeout(() => {
        const { selection: sel } = editor;
        if (!sel || !sel.anchor) return;
        // Trouve le nouveau paragraphe courant
        const newParagraphEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "paragraph" });
        if (!newParagraphEntry) return;
        const [newParagraphNode, newParagraphPath] = newParagraphEntry;
        const parentPath = Path.parent(newParagraphPath);
        const indexInParent = newParagraphPath[newParagraphPath.length - 1];
        const prevPath = indexInParent > 0 ? [...parentPath, indexInParent - 1] : null;
        const currEntry = Editor.node(editor, newParagraphPath);
        const prevEntry = prevPath ? Editor.node(editor, prevPath) : null;
        const currNode = currEntry ? currEntry[0] : null;
        const prevNode = prevEntry ? prevEntry[0] : null;
        const currIsEmpty = SlateElement.isElement(currNode) && Editor.string(editor, newParagraphPath) === "";
        const prevIsEmpty = SlateElement.isElement(prevNode) && Editor.string(editor, prevPath!) === "";
        // Si deux paragraphes vides consécutifs, sortir du blockquote
        if (currIsEmpty && prevIsEmpty) {
          // On retire le paragraphe du blockquote et on le place après le blockquote
          Transforms.removeNodes(editor, { at: newParagraphPath });
          Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] } as SlateElement, { at: Path.next(blockquotePath) });
          // Place le curseur dans le nouveau paragraphe
          Transforms.select(editor, {
            anchor: { path: Path.next(blockquotePath).concat([0]), offset: 0 },
            focus: { path: Path.next(blockquotePath).concat([0]), offset: 0 }
          });
        }
      }, 0);
    }
  };

  return (
    <div
      className={styles.editorMain}
      style={{
        minHeight: minHeight || '93vh',
        maxHeight: maxHeight || '93vh',
        maxWidth: maxWidth || '1300px',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 32,
          right: 32,
          zIndex: 2000,
          background: 'rgba(240,240,240,0.92)',
          color: '#222',
          padding: '14px 32px',
          borderRadius: 8,
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          fontSize: 17,
          fontWeight: 500,
          minWidth: 220,
          textAlign: 'left',
          opacity: 1,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Green check icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
            <circle cx="12" cy="12" r="12" fill="#4caf50" />
            <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{toast}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
        <Toolbar onFormat={toggleFormat} onBlock={handleBlock} onToggleHtml={() => setShowHtml((v) => !v)} />
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: showHtml ? 'block' : 'flex' }}>
            <Slate
              key={String(itemId) + '-' + JSON.stringify(value)}
              editor={editor}
              initialValue={Array.isArray(value) && value.length > 0 ? value : defaultValue}
              onChange={handleChange}
            >
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Écrivez votre texte ici..."
                style={{ minHeight: 120, outline: "none", padding: 8, width: '100%' }}
                onKeyDown={handleKeyDown}
                onPaste={event => {
                  // Custom paste handler for table cells
                  const { selection } = editor;
                  if (!selection) return;
                  const cellEntry = Editor.above(editor, { match: n => SlateElement.isElement(n) && (n as CustomElement).type === "table-cell" });
                  if (cellEntry) {
                    event.preventDefault();
                    const html = event.clipboardData.getData("text/html");
                    const text = event.clipboardData.getData("text/plain");
                    let nodes: CustomDescendant[] = [];
                    if (html) {
                      nodes = htmlToSlate(html);
                    } else if (text) {
                      nodes = [{ text }];
                    }
                    // Insert nodes into the current cell
                    const [cellNode, cellPath] = cellEntry;
                    // Remove current cell content
                    Transforms.delete(editor, { at: cellPath.concat([0]) });
                    // Insert pasted nodes
                    Transforms.insertNodes(editor, nodes, { at: cellPath.concat([0]) });
                    // Place cursor at end of pasted content
                    let endPoint;
                    const lastNodePath = cellPath.concat([nodes.length - 1]);
                    try {
                      endPoint = Editor.end(editor, lastNodePath);
                    } catch {
                      // If lastNodePath does not exist, use end of cell
                      endPoint = Editor.end(editor, cellPath);
                    }
                    Transforms.select(editor, endPoint);
                    // Scroll selection into view
                    setTimeout(() => {
                      try {
                        ReactEditor.focus(editor);
                        if (editor.selection && Range.isRange(editor.selection)) {
                          const domRange = ReactEditor.toDOMRange(editor, editor.selection);
                          if (domRange) {
                            const el = domRange.endContainer.parentElement || domRange.endContainer;
                            if (el instanceof Element) {
                              el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                            }
                          }
                        }
                      } catch {}
                    }, 0);
                  }
                }}
              />
            </Slate>
          </div>
          {showHtml && (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start' }}>
              <pre style={{ background: '#f5f5f5', color: '#222', padding: 16, borderRadius: 8, fontSize: 15, width: '100%', maxWidth: '100%', overflowX: 'auto', margin: 0 }}>
                {serializeHtml(value)}
              </pre>
            </div>
          )}
        </div>
        {/* Modal Annuler */}
        {showCancelModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', padding: 32, minWidth: 320, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 18 }}>Souhaitez-vous annuler vos dernières modifications ?</div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button onClick={handleCancel} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Oui</button>
                <button onClick={() => setShowCancelModal(false)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Non</button>
              </div>
            </div>
          </div>
        )}
        {loading && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}><span>Chargement...</span></div>}
      </div>
      {/* ...removed round close button, now handled by parent HtmlContent... */}
    </div>
  );
};

// ---- HTML Serializer ----

function serializeHtml(nodes: CustomDescendant[]): string {
  return nodes.map(n => serializeNode(n)).join("\n");
}

function serializeNode(node: CustomDescendant): string {
  if ((node as CustomElement).type) {
    const children = (node as CustomElement).children.map(serializeNode).join("");
    const type = (node as CustomElement).type;
    switch (type) {
      case "image": return `<img src='${(node as any).url}' alt='${(node as any).alt || "image"}' style='max-width:100%;max-height:320px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.07);' />`;
      case "table": return `<table><tbody>${children}</tbody></table>`;
      case "table-row": return `<tr>${children}</tr>`;
      case "table-cell": return `<td>${children}</td>`;
      case "paragraph": return `<p>${children}</p>`;
      case "heading-1": return `<h1>${children}</h1>`;
      case "heading-2": return `<h2>${children}</h2>`;
      case "heading-3": return `<h3>${children}</h3>`;
      case "heading-4": return `<h4>${children}</h4>`;
      case "heading-5": return `<h5>${children}</h5>`;
      case "bulleted-list": return `<ul>${children}</ul>`;
      case "numbered-list": return `<ol>${children}</ol>`;
      case "list-item": return `<li>${children}</li>`;
      case "code-block": return `<pre><code>${children}</code></pre>`;
      case "hr": return `<hr />`;
      case "blockquote-info": return `<blockquote class='info'>${children}</blockquote>`;
      case "blockquote-success": return `<blockquote class='success'>${children}</blockquote>`;
      case "blockquote-warning": return `<blockquote class='warning'>${children}</blockquote>`;
      case "blockquote-error": return `<blockquote class='error'>${children}</blockquote>`;
      case "link": return `<a href='${(node as any).url}'>${children}</a>`;
      default: return children;
    }
  }
  let text = (node as CustomText).text;
  if ((node as CustomText).bold) text = `<strong>${text}</strong>`;
  if ((node as CustomText).italic) text = `<em>${text}</em>`;
  if ((node as CustomText).underline) text = `<u>${text}</u>`;
  if ((node as CustomText).code) text = `<code>${text}</code>`;
  return text;
}

export default HtmlEditor;
