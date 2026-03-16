import { useMemo, useState } from "react";
import { useBudget } from "@hooks/useBudget";
import { BudgetType, BudgetFilters } from "@/core/types/budget";
import BudgetSummary from "@components/budget/BudgetSummary";
import BudgetChart from "@components/budget/BudgetChart";
import { ChevronLeft, ChevronRight, BarChart3, Check, X } from "lucide-react";

const TYPE_LABELS: Record<BudgetType, string> = {
  revenu: "Revenu",
  charges: "Charges",
  achat: "Achat",
  aide: "Aide",
};

const TYPE_COLORS: Record<BudgetType, string> = {
  revenu: "var(--budget-revenu)",
  charges: "var(--budget-charges)",
  achat: "var(--budget-achat)",
  aide: "var(--budget-aide)",
};

const TYPE_BG: Record<BudgetType, string> = {
  revenu: "#f0fdf4",
  charges: "#fef2f2",
  achat: "#fffbeb",
  aide: "#eff6ff",
};

interface AggregatedRow {
  type: BudgetType;
  organisme: string;
  montant: number;
  count: number;
  moisCount: number;
  allValide: boolean;
}

export default function BudgetAnnuel() {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState<BudgetType | "">("");
  const [showCharts, setShowCharts] = useState(false);

  const filters: BudgetFilters = {
    annee,
    ...(filterType ? { type: filterType as BudgetType } : {}),
  };

  const { entries, summary, loading } = useBudget(filters);

  // Aggregate by type + organisme
  const aggregated = useMemo(() => {
    const map = new Map<string, AggregatedRow & { moisSet: Set<number> }>();
    entries.forEach((e) => {
      const key = `${e.type}__${e.organisme}`;
      const existing = map.get(key);
      if (existing) {
        existing.montant += e.montant;
        existing.count += 1;
        existing.moisSet.add(e.mois);
        if (e.statut !== "valide") existing.allValide = false;
      } else {
        map.set(key, {
          type: e.type,
          organisme: e.organisme,
          montant: e.montant,
          count: 1,
          moisSet: new Set([e.mois]),
          moisCount: 0,
          allValide: e.statut === "valide",
        });
      }
    });
    return Array.from(map.values()).map(({ moisSet, ...row }) => ({
      ...row,
      moisCount: moisSet.size,
    })).sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return b.montant - a.montant;
    });
  }, [entries]);

  const revenus = aggregated.filter((r) => r.type === "revenu");
  const aides = aggregated.filter((r) => r.type === "aide");
  const charges = aggregated.filter((r) => r.type === "charges");

  // Achats: detail by note for S1-S5, group the rest
  const achatsDetailed = useMemo(() => {
    const achatEntries = entries.filter((e) => e.type === "achat");
    const map = new Map<string, AggregatedRow & { moisSet: Set<number>; note: string }>();

    achatEntries.forEach((e) => {
      const isWeekly = /^s\d/i.test(e.note || "");
      const noteKey = isWeekly ? (e.note || "").toUpperCase() : "__other__";
      const key = `${e.organisme}__${noteKey}`;
      const existing = map.get(key);
      if (existing) {
        existing.montant += e.montant;
        existing.count += 1;
        existing.moisSet.add(e.mois);
        if (e.statut !== "valide") existing.allValide = false;
      } else {
        map.set(key, {
          type: "achat",
          organisme: e.organisme,
          note: noteKey === "__other__" ? "Autre" : noteKey,
          montant: e.montant,
          count: 1,
          moisSet: new Set([e.mois]),
          moisCount: 0,
          allValide: e.statut === "valide",
        });
      }
    });

    return Array.from(map.values()).map(({ moisSet, ...row }) => ({
      ...row,
      moisCount: moisSet.size,
    })).sort((a, b) => {
      const aIsWeekly = /^S\d/.test(a.note);
      const bIsWeekly = /^S\d/.test(b.note);
      if (aIsWeekly && !bIsWeekly) return -1;
      if (!aIsWeekly && bIsWeekly) return 1;
      return a.note.localeCompare(b.note, undefined, { numeric: true });
    });
  }, [entries]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Vue annuelle</h1>
          <p style={{ color: "var(--app-text-secondary)", margin: "4px 0 0", fontSize: 14 }}>
            Totaux par organisme sur l'annee
          </p>
        </div>
        <button
          onClick={() => setShowCharts(!showCharts)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            backgroundColor: showCharts ? "var(--app-primary)" : "white",
            color: showCharts ? "white" : "var(--app-text)",
            border: showCharts ? "1px solid var(--app-primary)" : "1px solid var(--app-border)",
          }}
        >
          <BarChart3 size={18} />
          Graphiques
        </button>
      </div>

      {/* Year navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => setAnnee(annee - 1)} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: 16, fontWeight: 600, minWidth: 80, textAlign: "center" }}>{annee}</span>
        <button onClick={() => setAnnee(annee + 1)} style={navBtnStyle}><ChevronRight size={18} /></button>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as BudgetType | "")}
          style={{ ...filterSelectStyle, marginLeft: "auto" }}
        >
          <option value="">Tous les types</option>
          <option value="revenu">Revenus</option>
          <option value="charges">Charges</option>
          <option value="achat">Achats</option>
          <option value="aide">Aides</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--app-text-secondary)" }}>Chargement...</div>
      ) : (
        <>
          <BudgetSummary summary={summary} />

          {showCharts && <BudgetChart entries={entries} mois={0} annee={annee} layout="annuel" />}

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {revenus.length > 0 && <AggregatedTable title="Revenus" rows={revenus} accentColor="var(--budget-revenu)" />}
            {aides.length > 0 && <AggregatedTable title="Aides" rows={aides} accentColor="var(--budget-aide)" />}
            {achatsDetailed.length > 0 && <AchatsDetailTable rows={achatsDetailed} />}
            {charges.length > 0 && <AggregatedTable title="Charges" rows={charges} accentColor="var(--budget-charges)" />}
          </div>
        </>
      )}
    </div>
  );
}

function AggregatedTable({
  title,
  rows,
  accentColor,
}: {
  title: string;
  rows: AggregatedRow[];
  accentColor: string;
}) {
  const total = rows.reduce((s, r) => s + r.montant, 0);

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--app-border)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--app-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
          {total.toLocaleString("fr-FR")} €
        </span>
      </div>

      <AnnualTableBody rows={rows} />
    </div>
  );
}

function AnnualTableBody({ rows }: { rows: (AggregatedRow & { note?: string })[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 40 }} />
          <col style={{ width: 70 }} />
          <col />
          <col style={{ width: 120 }} />
          <col style={{ width: 70 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 90 }} />
          <col style={{ width: 100 }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--app-border)", textAlign: "left" }}>
            <th style={{ ...thStyle, textAlign: "center" }}></th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Organisme</th>
            <th style={thStyle}>Note</th>
            <th style={{ ...thStyle}}>Entrees</th>
            <th></th>
            <th style={{ ...thStyle}}>Mensuel</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--app-border)" }}>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {row.allValide ? (
                  <Check size={16} color="var(--app-success)" strokeWidth={2.5} />
                ) : (
                  <X size={16} color="#ef444466" strokeWidth={2.5} />
                )}
              </td>
              <td style={tdStyle}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: TYPE_COLORS[row.type],
                  backgroundColor: TYPE_BG[row.type],
                }}>
                  {TYPE_LABELS[row.type]}
                </span>
              </td>
              <td style={{ ...tdStyle, fontWeight: 500, textTransform: "capitalize" }}>{row.organisme}</td>
              <td style={{ ...tdStyle, color: "var(--app-text-secondary)" }}>{row.note || "—"}</td>
              <td style={{ ...tdStyle, textAlign: "center", color: "var(--app-text-secondary)" }}>{row.count}</td>
              <td></td>
              <td style={{ ...tdStyle, color: "var(--app-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                {Math.round(row.montant / row.moisCount).toLocaleString("fr-FR")} €
              </td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {row.montant.toLocaleString("fr-FR")} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AchatsDetailTable({ rows }: { rows: (AggregatedRow & { note: string })[] }) {
  const total = rows.reduce((s, r) => s + r.montant, 0);

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--app-border)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--app-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Achats</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--budget-achat)", fontVariantNumeric: "tabular-nums" }}>
          {total.toLocaleString("fr-FR")} €
        </span>
      </div>
      <AnnualTableBody rows={rows} />
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid var(--app-border)",
  background: "white",
  cursor: "pointer",
  color: "var(--app-text)",
};

const filterSelectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--app-border)",
  fontSize: 13,
  fontFamily: "inherit",
  color: "var(--app-text)",
  outline: "none",
  background: "white",
};

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
