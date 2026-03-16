import { BudgetSummary as BudgetSummaryType } from "@/core/types/budget";
import { TrendingUp, TrendingDown, MoveRight, ShoppingCart, HandCoins } from "lucide-react";

interface Props {
  summary: BudgetSummaryType;
  prevSummary?: BudgetSummaryType;
}

const cards = [
  { key: "totalRevenus", label: "Revenus", icon: TrendingUp, color: "var(--budget-revenu)", bg: "#f0fdf4", positive: true },
  { key: "totalCharges", label: "Charges", icon: TrendingDown, color: "var(--budget-charges)", bg: "#fef2f2", positive: false },
  { key: "totalAchats", label: "Achats", icon: ShoppingCart, color: "var(--budget-achat)", bg: "#fffbeb", positive: false },
  { key: "totalAides", label: "Aides", icon: HandCoins, color: "var(--budget-aide)", bg: "#eff6ff", positive: true },
] as const;

function TrendArrow({ current, previous, positive }: { current: number; previous: number; positive: boolean }) {
  if (previous === 0 && current === 0) return null;

  const diff = current - previous;
  const isUp = diff > 0;
  const isEqual = diff === 0;

  let color: string;
  let Icon: typeof TrendingUp;

  if (isEqual) {
    color = "#3b82f6";
    Icon = MoveRight;
  } else {
    const isGood = positive ? isUp : !isUp;
    color = isGood ? "#22c55e" : "#ef4444";
    Icon = isUp ? TrendingUp : TrendingDown;
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 22,
      height: 22,
      borderRadius: "50%",
      backgroundColor: color + "18",
      border: `1px solid ${color}44`,
      flexShrink: 0,
    }}>
      <Icon size={11} color={color} />
    </div>
  );
}

export default function BudgetSummary({ summary, prevSummary }: Props) {
  return (
    <div className="summary-cards">
      {cards.map(({ key, label, icon: Icon, color, bg, positive }) => (
        <div
          key={key}
          style={{
            background: bg,
            borderRadius: 12,
            padding: "20px 24px",
            border: `1px solid ${color}22`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon size={18} color={color} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--app-text-secondary)" }}>{label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color }}>
              {summary[key].toLocaleString("fr-FR")} €
            </span>
            {prevSummary && (
              <TrendArrow current={summary[key]} previous={prevSummary[key]} positive={positive} />
            )}
          </div>
        </div>
      ))}

      <div
        style={{
          background: summary.solde >= 0 ? "#f0fdf4" : "#fef2f2",
          borderRadius: 12,
          padding: "20px 24px",
          border: `1px solid ${summary.solde >= 0 ? "var(--budget-revenu)" : "var(--budget-charges)"}22`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--app-text-secondary)" }}>Solde</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: summary.solde >= 0 ? "var(--budget-revenu)" : "var(--budget-charges)",
            }}
          >
            {summary.solde >= 0 ? "+" : ""}
            {summary.solde.toLocaleString("fr-FR")} €
          </span>
          {prevSummary && (
            <TrendArrow current={summary.solde} previous={prevSummary.solde} positive={true} />
          )}
        </div>
      </div>
    </div>
  );
}
