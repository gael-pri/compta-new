import { useMemo } from "react";
import { BudgetProEntry } from "@/core/types/budget-pro";

interface Props {
  entries: BudgetProEntry[];
  tvaCumul: number;
  onPayTva?: () => void;
  mois: number;
  annee: number;
}

export default function BudgetProBilan({ entries, tvaCumul, onPayTva, mois, annee }: Props) {
  const bilan = useMemo(() => {
    const recettes = entries.filter((e) => e.type === "recette");
    const depenses = entries.filter((e) => e.type === "depense");
    const dividendesEntries = entries.filter((e) => e.type === "dividendes");
    const impotsEntries = entries.filter((e) => e.type === "impots");

    const totalRecettesHT = recettes.reduce((s, e) => s + e.montant_ht, 0);
    const totalDepensesHT = depenses.reduce((s, e) => s + e.montant_ht, 0);
    const totalDividendes = dividendesEntries.reduce((s, e) => s + e.montant_ht, 0);
    const totalImpotsPaies = impotsEntries.reduce((s, e) => s + e.montant_ht, 0);
    const totalArgentAvance = entries.reduce((s, e) => s + (e.argent_avance || 0), 0);

    // TVA du mois
    const tvaCollectee = recettes.reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0);
    const tvaDeductible = depenses.reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0);
    const tvaNetteMois = tvaCollectee - tvaDeductible;
    // tvaCumul = solde courant persisté (positif = à payer, négatif = reportable)
    const tvaAPayer = tvaCumul > 0 ? tvaCumul : 0;
    const tvaReportable = tvaCumul < 0 ? Math.abs(tvaCumul) : 0;

    // Resultat fiscal (recettes - depenses, hors dividendes et impots)
    const resultatFiscal = totalRecettesHT - totalDepensesHT;

    // IS : 15% jusqu'a 42500, 25% au-dela
    const impots15 = Math.min(Math.max(resultatFiscal, 0), 42500) * 0.15;
    const impots25 = Math.max(resultatFiscal - 42500, 0) * 0.25;
    const totalIS = impots15 + impots25;

    // Benefices apres IS
    const benefices = resultatFiscal - totalIS;

    // Flat tax sur dividendes (30%)
    const flatTax = totalDividendes * 0.30;

    // Equilibre : benefices apres IS - TVA nette - dividendes
    const equilibre = benefices - tvaNetteMois - totalDividendes;

    return {
      totalRecettesHT,
      totalDepensesHT,
      totalDividendes,
      totalImpotsPaies,
      totalArgentAvance,
      tvaCollectee,
      tvaDeductible,
      tvaNetteMois,
      tvaAPayer,
      tvaReportable,
      resultatFiscal,
      impots15,
      impots25,
      totalIS,
      benefices,
      flatTax,
      equilibre,
    };
  }, [entries, tvaCumul]);

  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--app-border)", overflow: "hidden", marginBottom: 24 }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--app-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Bilan {mois > 0 ? "mensuel" : "annuel"}</span>
      </div>

      <div className="bilan-grid">
        {/* Left column */}
        <div className="bilan-col-left">
          <Row label="Total recettes HT" value={`${fmt(bilan.totalRecettesHT)} €`} color="#22c55e" />
          <Row label="Total depenses HT" value={`${fmt(bilan.totalDepensesHT)} €`} color="#ef4444" />
          <Row label="Resultat fiscal" value={`${fmt(bilan.resultatFiscal)} €`} bold />
          <Separator />
          <Row label="IS a 15% (≤ 42 500 €)" value={`${fmt(bilan.impots15)} €`} color="#8b5cf6" />
          <Row label="IS a 25% (> 42 500 €)" value={`${fmt(bilan.impots25)} €`} color="#8b5cf6" />
          <Row label="Total IS estime" value={`${fmt(bilan.totalIS)} €`} bold color="#8b5cf6" />
          <Separator />
          <Row label="Benefices apres IS" value={`${fmt(bilan.benefices)} €`} bold color="#22c55e" />
        </div>

        {/* Right column */}
        <div>
          <Row label="TVA collectee" value={`${fmt(bilan.tvaCollectee)} €`} />
          <Row label="TVA deductible" value={`-${fmt(bilan.tvaDeductible)} €`} />
          <Row label="TVA nette" value={`${fmt(bilan.tvaNetteMois)} €`} />
          <Separator />
          <Row
            label={bilan.tvaAPayer > 0 ? "Solde TVA a payer" : "Solde TVA reportable"}
            value={`${fmt(bilan.tvaAPayer > 0 ? bilan.tvaAPayer : bilan.tvaReportable)} €`}
            bold
            color={bilan.tvaAPayer > 0 ? "#ef4444" : "#3b82f6"}
            action={bilan.tvaAPayer > 0 && onPayTva ? onPayTva : undefined}
            actionLabel="Payer"
          />
          <Separator />
          <Row label="Dividendes verses" value={`${fmt(bilan.totalDividendes)} €`} color="#f59e0b" />
          <Row label="Flat tax (30%)" value={`${fmt(bilan.flatTax)} €`} color="#f59e0b" />
          <Separator />
          <Row label="Argent avance" value={`${fmt(bilan.totalArgentAvance)} €`} color="var(--app-text-secondary)" />
          <Row
            label="Equilibre"
            value={`${bilan.equilibre >= 0 ? "+" : ""}${fmt(bilan.equilibre)} €`}
            bold
            color={bilan.equilibre >= 0 ? "#22c55e" : "#ef4444"}
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  color,
  action,
  actionLabel,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: bold ? 700 : 400,
    }}>
      <span style={{ color: "var(--app-text-secondary)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: color || "var(--app-text)", fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 600 }}>
          {value}
        </span>
        {action && (
          <button
            onClick={action}
            style={{
              padding: "3px 10px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#ef444422",
              color: "#ef4444",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function Separator() {
  return <div style={{ borderBottom: "1px solid var(--app-border)", margin: "0 16px" }} />;
}
