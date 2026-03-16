import { BudgetEntry, BudgetType } from "@/core/types/budget";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface Props {
  entries: BudgetEntry[];
  onEdit: (entry: BudgetEntry) => void;
  onDelete: (id: number) => void;
  onToggleStatut?: (id: number, newStatut: string) => void;
}

const typeLabels: Record<BudgetType, string> = {
  revenu: "Revenu",
  charges: "Charges",
  achat: "Achat",
  aide: "Aide",
};

const typeColors: Record<BudgetType, string> = {
  revenu: "var(--budget-revenu)",
  charges: "var(--budget-charges)",
  achat: "var(--budget-achat)",
  aide: "var(--budget-aide)",
};

const typeBg: Record<BudgetType, string> = {
  revenu: "#f0fdf4",
  charges: "#fef2f2",
  achat: "#fffbeb",
  aide: "#eff6ff",
};

function SingleTable({
  title,
  entries,
  onEdit,
  onDelete,
  onToggleStatut,
  accentColor,
}: {
  title: string;
  entries: BudgetEntry[];
  onEdit: (entry: BudgetEntry) => void;
  onDelete: (id: number) => void;
  onToggleStatut?: (id: number, newStatut: string) => void;
  accentColor: string;
}) {
  const total = entries.reduce((s, e) => s + e.montant, 0);

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--app-border)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--app-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
          {total.toLocaleString("fr-FR")} €
        </span>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: "var(--app-text-secondary)", fontSize: 14 }}>
          Aucune entree.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--app-border)", textAlign: "left" }}>
                <th style={{ ...thStyle, width: 40, textAlign: "center" }}></th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Organisme</th>
                <th style={thStyle}>Note</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Montant</th>
                <th style={{ ...thStyle, ...stickyColStyle, textAlign: "right", width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => onToggleStatut?.(entry.id, entry.statut === "valide" ? "en_attente" : "valide")}
                      style={statutBtnStyle}
                      title={entry.statut === "valide" ? "Passer en attente" : "Valider"}
                    >
                      {entry.statut === "valide" ? (
                        <Check size={16} color="var(--app-success)" strokeWidth={2.5} />
                      ) : (
                        <X size={16} color="#ef444466" strokeWidth={2.5} />
                      )}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: typeColors[entry.type],
                        backgroundColor: typeBg[entry.type],
                      }}
                    >
                      {typeLabels[entry.type]}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500, textTransform: "capitalize" }}>{entry.organisme}</td>
                  <td style={{ ...tdStyle, color: "var(--app-text-secondary)" }}>{entry.note || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {entry.montant.toLocaleString("fr-FR")} €
                  </td>
                  <td style={{ ...tdStyle, ...stickyColStyle, textAlign: "right" }}>
                    <button onClick={() => onEdit(entry)} style={actionBtn} title="Modifier">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(entry.id)} style={{ ...actionBtn, color: "var(--app-error)" }} title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function BudgetTable({ entries, onEdit, onDelete, onToggleStatut }: Props) {
  const revenus = entries.filter((e) => e.type === "revenu");
  const aides = entries.filter((e) => e.type === "aide");
  const achats = entries.filter((e) => e.type === "achat").sort((a, b) => {
    const isWeekly = (n: string) => /^s\d/i.test(n);
    const noteA = (a.note || "").toUpperCase();
    const noteB = (b.note || "").toUpperCase();
    const aIsWeekly = isWeekly(noteA);
    const bIsWeekly = isWeekly(noteB);
    if (aIsWeekly && !bIsWeekly) return -1;
    if (!aIsWeekly && bIsWeekly) return 1;
    return noteA.localeCompare(noteB, undefined, { numeric: true });
  });
  const charges = entries.filter((e) => e.type === "charges");

  const tables = [
    { title: "Revenus", entries: revenus, color: "var(--budget-revenu)" },
    { title: "Aides", entries: aides, color: "var(--budget-aide)" },
    { title: "Achats", entries: achats, color: "var(--budget-achat)" },
    { title: "Charges", entries: charges, color: "var(--budget-charges)" },
  ].filter((t) => t.entries.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {tables.map((t) => (
        <SingleTable key={t.title} title={t.title} entries={t.entries} onEdit={onEdit} onDelete={onDelete} onToggleStatut={onToggleStatut} accentColor={t.color} />
      ))}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--app-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
};

const statutBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const stickyColStyle: React.CSSProperties = {
  position: "sticky",
  right: 0,
  background: "white",
  boxShadow: "-4px 0 8px rgba(0,0,0,0.04)",
};

const actionBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  color: "var(--app-text-secondary)",
  borderRadius: 4,
};
