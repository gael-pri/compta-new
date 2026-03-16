import React, { useEffect, useState } from "react";
import styles from "./HtmlContent.module.css";
import { CustomDescendant } from "./HtmlEditor";
//import { supabase } from "@lib/supabaseClient";

export interface HtmlViewerProps {
  value?: CustomDescendant[];
  tableName?: string;
  columnName?: string;
  refName?: string;
  itemId?: string;
  minHeight?: string;
  maxHeight?: string;
  maxWidth?: string;
}

function serializeNode(node: CustomDescendant): string {
  if (!node) return "";
  if ((node as any).text !== undefined) {
    let text = (node as any).text;
    if ((node as any).bold) text = `<strong>${text}</strong>`;
    if ((node as any).italic) text = `<em>${text}</em>`;
    if ((node as any).underline) text = `<u>${text}</u>`;
    if ((node as any).code) text = `<code style="background:#efefef;padding:2px 4px;border-radius:3px;">${text}</code>`;
    return text;
  }
  const el = node as any;
  const childrenHtml = el.children?.map(serializeNode).join("") || "";
  switch (el.type) {
    case "paragraph": {
      // Si le paragraphe ne contient qu'un code inline, ne pas entourer de <p>
      const trimmed = childrenHtml.trim();
      if (trimmed.startsWith('<code') && trimmed.endsWith('</code>') && trimmed === childrenHtml) {
          // Ajoute uniquement un margin-bottom et display:block, sans toucher au style existant
          if (childrenHtml.includes('style=')) {
            // Ajoute margin-bottom et display:inline-block au style existant
            return childrenHtml.replace('<code style="', '<code style="margin-bottom:px;display:inline-block;');
          } else {
            // Ajoute un style minimal si absent
            return childrenHtml.replace('<code', '<code style="margin-bottom:px;display:inline-block;"');
          }
      }
        // Réduit uniquement la marge verticale, garde le retrait à gauche
        return `<p class="${styles.paragraph}" style="margin:0.8em 0 0.8em 0.5em;">${childrenHtml}</p>`;
    }
    case "heading-1":
      return `<h1 class="${styles.heading1}">${childrenHtml}</h1>`;
    case "heading-2":
      return `<h2 class="${styles.heading2}">${childrenHtml}</h2>`;
    case "heading-3":
      return `<h3 class="${styles.heading3}">${childrenHtml}</h3>`;
    case "heading-4":
      return `<h4 class="${styles.heading4}">${childrenHtml}</h4>`;
    case "heading-5":
      return `<h5 class="${styles.heading5}">${childrenHtml}</h5>`;
    case "bulleted-list":
      return `<ul class="${styles.list}">${childrenHtml}</ul>`;
    case "numbered-list":
      return `<ol class="${styles.list}">${childrenHtml}</ol>`;
    case "list-item":
      return `<li class="${styles.listItem}">${childrenHtml}</li>`;
    case "blockquote-info":
      return `<blockquote class="${styles.blockquoteInfo}">${childrenHtml}</blockquote>`;
    case "blockquote-success":
      return `<blockquote class="${styles.blockquoteSuccess}">${childrenHtml}</blockquote>`;
    case "blockquote-warning":
      return `<blockquote class="${styles.blockquoteWarning}">${childrenHtml}</blockquote>`;
    case "blockquote-error":
      return `<blockquote class="${styles.blockquoteError}">${childrenHtml}</blockquote>`;
    case "hr":
      return `<hr class="${styles.hr}" />`;
    case "link":
      return `<a class="${styles.link}" href="${el.url}">${childrenHtml}</a>`;
    case "code-block": {
      // Échappe le contenu pour éviter l'interprétation HTML
      function escapeHtml(str: string) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\"/g, "&quot;")
                  .replace(/'/g, "&#39;");
      }
      return `<pre class="${styles.codeBlock}"><code>${escapeHtml(childrenHtml)}</code></pre>`;
    }
    case "table":
      return `<table class="${styles.table}"><tbody>${childrenHtml}</tbody></table>`;
    case "table-row":
      return `<tr>${childrenHtml}</tr>`;
    case "table-cell":
      return `<td class="${styles.tableCell}">${childrenHtml}</td>`;
    case "image":
      return `<img src="${el.url}" alt="${el.alt || 'image'}" style="max-width:100%;max-height:320px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.07);margin:1em 0;" />`;
    default:
      return childrenHtml;
  }
}

function serializeHtml(nodes: CustomDescendant[]): string {
  // Concatène les blocs sans \n pour éviter les espaces blancs entre paragraphes
  return nodes.map(n => serializeNode(n)).join("");
}

const defaultValue: CustomDescendant[] = [{ type: "paragraph", children: [{ text: "" }] }];

const HtmlViewer: React.FC<HtmlViewerProps & { onEdit?: () => void; editable?: boolean }> = ({ value, tableName, columnName, refName, itemId, onEdit, editable, minHeight = '93vh', maxHeight = '93vh', maxWidth = '1300px' }) => {
  const [content, setContent] = useState<CustomDescendant[]>(value || defaultValue);
  const [contentExists, setContentExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      if (tableName && columnName && refName && itemId) {
        const { data, error } = { data: null, error: null };
        
        // await supabase
        //   .from(tableName)
        //   .select(columnName)
        //   .eq(refName, itemId)
        //   .limit(1);

        type RowType = { [key: string]: any };
        const rows = data as RowType[] | null;
        let content = rows && rows[0] ? rows[0][columnName as string] : null;
        if (content && typeof content === "string") {
          try {
            const slateValue = JSON.parse(content);
            setContent(Array.isArray(slateValue) ? slateValue : defaultValue);
            setContentExists(true);
          } catch {
            setContent(defaultValue);
            setContentExists(true);
          }
        } else if (Array.isArray(content)) {
          setContent(content);
          setContentExists(true);
        } else {
          setContent(defaultValue);
          setContentExists(false);
        }
      }
    }
    fetchContent();
  }, [tableName, columnName, refName, itemId]);

  const handleCreateContent = async () => {
    setIsCreating(true);
    if (tableName && columnName && refName && itemId) {
      const { error } = {error: null} //await supabase
        // .from(tableName)
        // .insert({ [refName]: itemId, [columnName]: JSON.stringify(defaultValue) });
      if (!error) {
        setContent(defaultValue);
        setContentExists(true);
        if (onEdit) onEdit(); // Passe à l'éditeur directement
      }
    }
    setIsCreating(false);
  };

  if (contentExists === false) {
    return (
      <div style={{
        border: "2px dashed #4caf50",
        borderRadius: 12,
        padding: 48,
        background: "#f6fff6",
        minHeight: minHeight || '93vh',
        maxHeight: maxHeight || '93vh',
        maxWidth: maxWidth || '1300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#388e3c', marginBottom: 18 }}>
          Aucun contenu trouvé pour cet élément.
        </div>
        <div style={{ fontSize: 16, color: '#388e3c', marginBottom: 32 }}>
          Cliquez ci-dessous pour créer le contenu et commencer l'édition.
        </div>
        <button
          onClick={handleCreateContent}
          disabled={isCreating}
          style={{
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 32px',
            fontSize: 18,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            marginTop: 12,
          }}
        >
          {isCreating ? "Création..." : "Créer et éditer le contenu"}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: 36,
        background: "#fff",
        minHeight: minHeight || '93vh',
        maxHeight: maxHeight || '93vh',
        maxWidth: maxWidth || '1300px',
        position: "relative",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <div className={styles.htmlPreview} dangerouslySetInnerHTML={{ __html: serializeHtml(content) }} />
    </div>
  );
};

export default HtmlViewer;
