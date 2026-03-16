import React, { useMemo, useState, useEffect } from "react";
import { useBudgetPro } from "@hooks/useBudgetPro";
import { BudgetProType, BudgetProFilters } from "@/core/types/budget-pro";
import { backend } from "@/core/backend";
import BudgetProBilan from "@components/budget/BudgetProBilan";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

const TYPE_LABELS: Record<BudgetProType, string> = {
  recette: "Recette",
  depense: "Depense",
  dividendes: "Dividendes",
  impots: "Impots",
};

const TYPE_COLORS: Record<BudgetProType, string> = {
  recette: "#22c55e",
  depense: "#ef4444",
  dividendes: "#f59e0b",
  impots: "#8b5cf6",
};

const TYPE_BG: Record<BudgetProType, string> = {
  recette: "#f0fdf4",
  depense: "#fef2f2",
  dividendes: "#fffbeb",
  impots: "#f5f3ff",
};

interface AggregatedRow {
  type: BudgetProType;
  organisme: string;
  montant_ht: number;
  tva_total: number;
  montant_ttc: number;
  count: number;
  moisCount: number;
  allValide: boolean;
}

// Exercice fiscal : Nov N → Oct N+1
// "annee" = année de début de l'exercice (ex: 2025 = Nov 2025 → Oct 2026)
export default function BudgetProAnnuel() {
  // Default to current fiscal year: if we're in Nov or Dec, start year is current year, otherwise previous
  const now = new Date();
  const defaultYear = now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1;
  const [annee, setAnnee] = useState(defaultYear);
  const [filterType, setFilterType] = useState<BudgetProType | "">("");

  const typeFilter = filterType ? { type: filterType as BudgetProType } : {};

  // Fetch Nov-Dec of annee
  const { entries: entriesNovDec, loading: loading1 } = useBudgetPro({ annee, ...typeFilter });
  // Fetch Jan-Oct of annee+1
  const { entries: entriesJanOct, loading: loading2 } = useBudgetPro({ annee: annee + 1, ...typeFilter });

  const loading = loading1 || loading2;

  // Merge and filter to fiscal year only
  const entries = useMemo(() => {
    const fromNovDec = entriesNovDec.filter((e) => e.mois >= 11);
    const fromJanOct = entriesJanOct.filter((e) => e.mois <= 10);
    return [...fromNovDec, ...fromJanOct];
  }, [entriesNovDec, entriesJanOct]);

  const summary = useMemo(() => ({
    totalRecettes: entries.filter((e) => e.type === "recette").reduce((s, e) => s + e.montant_ht, 0),
    totalDepenses: entries.filter((e) => e.type === "depense").reduce((s, e) => s + e.montant_ht, 0),
    totalDividendes: entries.filter((e) => e.type === "dividendes").reduce((s, e) => s + e.montant_ht, 0),
    totalImpots: entries.filter((e) => e.type === "impots").reduce((s, e) => s + e.montant_ht, 0),
    totalTvaCollectee: entries.filter((e) => e.type === "recette").reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0),
    totalTvaDeductible: entries.filter((e) => e.type === "depense").reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0),
    get solde() { return this.totalRecettes - this.totalDepenses - this.totalDividendes - this.totalImpots; },
  }), [entries]);

  // Aggregate by type + organisme
  const aggregated = useMemo(() => {
    const map = new Map<string, AggregatedRow & { moisSet: Set<number> }>();
    entries.forEach((e) => {
      const key = `${e.type}__${e.organisme}`;
      const existing = map.get(key);
      const tvaAmount = e.montant_ttc - e.montant_ht;
      if (existing) {
        existing.montant_ht += e.montant_ht;
        existing.tva_total += tvaAmount;
        existing.montant_ttc += e.montant_ttc;
        existing.count += 1;
        existing.moisSet.add(e.mois);
        if (e.statut !== "valide") existing.allValide = false;
      } else {
        map.set(key, {
          type: e.type,
          organisme: e.organisme,
          montant_ht: e.montant_ht,
          tva_total: tvaAmount,
          montant_ttc: e.montant_ttc,
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
      return b.montant_ht - a.montant_ht;
    });
  }, [entries]);

  const [tvaCumul, setTvaCumul] = useState(0);
  useEffect(() => {
    backend.comptaParams.get("tva_cumul").then((p) => setTvaCumul(p?.value ?? 0));
  }, []);

  const recettes = aggregated.filter((r) => r.type === "recette");
  const depenses = aggregated.filter((r) => r.type === "depense");
  const dividendes = aggregated.filter((r) => r.type === "dividendes");
  const impots = aggregated.filter((r) => r.type === "impots");

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Vue annuelle Pro</h1>
          <p style={{ color: "var(--app-text-secondary)", margin: "4px 0 0", fontSize: 14 }}>
            Totaux par organisme sur l'annee
          </p>
        </div>
      </div>

      {/* Year navigator */}
      <div className="page-nav">
        <button onClick={() => setAnnee(annee - 1)} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: 16, fontWeight: 600, minWidth: 200, textAlign: "center" }}>
          Nov {annee} — Oct {annee + 1}
        </span>
        <button onClick={() => setAnnee(annee + 1)} style={navBtnStyle}><ChevronRight size={18} /></button>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as BudgetProType | "")}
          style={{ ...filterSelectStyle, marginLeft: "auto" }}
        >
          <option value="">Tous les types</option>
          <option value="recette">Recettes</option>
          <option value="depense">Depenses</option>
          <option value="dividendes">Dividendes</option>
          <option value="impots">Impots</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--app-text-secondary)" }}>Chargement...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="summary-cards">
            <SummaryCard label="Recettes HT" value={summary.totalRecettes} color={TYPE_COLORS.recette} bg={TYPE_BG.recette} />
            <SummaryCard label="Depenses HT" value={summary.totalDepenses} color={TYPE_COLORS.depense} bg={TYPE_BG.depense} />
            <SummaryCard label="TVA collectee" value={summary.totalTvaCollectee} color={TYPE_COLORS.recette} bg={TYPE_BG.recette} />
            <SummaryCard label="TVA deductible" value={summary.totalTvaDeductible} color={TYPE_COLORS.depense} bg={TYPE_BG.depense} />
            <SummaryCard
              label="Solde HT"
              value={summary.solde}
              color={summary.solde >= 0 ? TYPE_COLORS.recette : TYPE_COLORS.depense}
              bg={summary.solde >= 0 ? TYPE_BG.recette : TYPE_BG.depense}
              prefix={summary.solde >= 0 ? "+" : ""}
            />
          </div>

          {/* Bilan annuel */}
          <BudgetProBilan
            entries={entries}
            tvaCumul={tvaCumul}
            mois={0}
            annee={annee}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {recettes.length > 0 && <AggregatedTable title="Recettes" rows={recettes} accentColor={TYPE_COLORS.recette} />}
            {depenses.length > 0 && <AggregatedTable title="Depenses" rows={depenses} accentColor={TYPE_COLORS.depense} />}
            {dividendes.length > 0 && <AggregatedTable title="Dividendes" rows={dividendes} accentColor={TYPE_COLORS.dividendes} />}
            {impots.length > 0 && <AggregatedTable title="Impots" rows={impots} accentColor={TYPE_COLORS.impots} />}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Summary Card ─── */

function SummaryCard({
  label,
  value,
  color,
  bg,
  prefix = "",
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  prefix?: string;
}) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "20px 24px", border: `1px solid ${color}22` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--app-text-secondary)" }}>{label}</span>
      </div>
      <span style={{ fontSize: 24, fontWeight: 700, color }}>
        {prefix}{value.toLocaleString("fr-FR")} €
      </span>
    </div>
  );
}

/* ─── Aggregated Table ─── */

function AggregatedTable({
  title,
  rows,
  accentColor,
}: {
  title: string;
  rows: AggregatedRow[];
  accentColor: string;
}) {
  const totalHT = rows.reduce((s, r) => s + r.montant_ht, 0);

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--app-border)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--app-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
          {totalHT.toLocaleString("fr-FR")} € HT
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 650, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--app-border)", textAlign: "left" }}>
              <th style={{ ...thStyle, textAlign: "center" }}></th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Organisme</th>
              <th style={thStyle}>Entrees</th>
              <th style={{ ...thStyle, textAlign: "right" }}>HT</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Mensuel HT</th>
              <th style={{ ...thStyle, textAlign: "right" }}>TVA total</th>
              <th style={{ ...thStyle, ...stickyTotalStyle, textAlign: "right" }}>TTC total</th>
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
                <td style={{ ...tdStyle, color: "var(--app-text-secondary)" }}>{row.count}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {row.montant_ht.toLocaleString("fr-FR")} €
                </td>
                <td style={{ ...tdStyle, textAlign: "right", color: "var(--app-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(row.montant_ht / row.moisCount).toLocaleString("fr-FR")} €
                </td>
                <td style={{ ...tdStyle, textAlign: "right", color: "var(--app-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(row.tva_total).toLocaleString("fr-FR")} €
                </td>
                <td style={{ ...tdStyle, ...stickyTotalStyle, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {row.montant_ttc.toLocaleString("fr-FR")} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Styles ─── */

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

const stickyTotalStyle: React.CSSProperties = {
  position: "sticky",
  right: 0,
  background: "white",
  boxShadow: "-4px 0 8px rgba(0,0,0,0.04)",
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
