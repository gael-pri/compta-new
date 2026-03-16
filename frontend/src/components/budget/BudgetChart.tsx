import { useMemo } from "react";
import GraphJs from "@components/graphs/GraphJs/GraphJs";
import { BudgetEntry } from "@/core/types/budget";

interface Props {
  entries: BudgetEntry[];
  mois: number;
  annee: number;
  layout?: "mensuel" | "annuel";
}

const TYPE_COLORS: Record<string, string> = {
  revenu: "#22c55e",
  charges: "#ef4444",
  achat: "#f59e0b",
  aide: "#3b82f6",
};

const MOIS_LABELS = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export default function BudgetChart({ entries, mois, annee, layout = "mensuel" }: Props) {
  const isAnnuel = layout === "annuel";

  // --- Revenue balance bar (Gael vs Enora) ---
  const balance = useMemo(() => {
    const revenus = entries.filter((e) => e.type === "revenu");
    const gael = revenus
      .filter((e) => e.organisme.toLowerCase().includes("gael"))
      .reduce((s, e) => s + e.montant, 0);
    const enora = revenus
      .filter((e) => e.organisme.toLowerCase().includes("enora"))
      .reduce((s, e) => s + e.montant, 0);
    const total = gael + enora;
    return { gael, enora, total, gaelPct: total > 0 ? (gael / total) * 100 : 50 };
  }, [entries]);

  // --- Donut: repartition par type ---
  const donutData = useMemo(() => {
    const types = ["revenu", "charges", "achat", "aide"];
    const totals = types.map((t) =>
      entries.filter((e) => e.type === t).reduce((s, e) => s + e.montant, 0)
    );
    return {
      labels: ["Revenus", "Charges", "Achats", "Aides"],
      datasets: [{
        label: "Repartition",
        data: totals,
        backgroundColor: types.map((t) => TYPE_COLORS[t]),
        borderWidth: 0,
      }],
    };
  }, [entries]);

  // --- Courses line ---
  const coursesData = useMemo(() => {
    // Only weekly entries (note starts with S)
    const weeklyAchats = entries
      .filter((e) => e.type === "achat" && /^s\d/i.test(e.note || ""))
      .sort((a, b) => {
        if (a.mois !== b.mois) return a.mois - b.mois;
        const noteA = (a.note || "").toUpperCase();
        const noteB = (b.note || "").toUpperCase();
        return noteA.localeCompare(noteB, undefined, { numeric: true });
      });

    if (isAnnuel) {
      // Annual: group by month
      const byMonth = new Map<number, number>();
      weeklyAchats.forEach((e) => {
        byMonth.set(e.mois, (byMonth.get(e.mois) || 0) + e.montant);
      });
      const months = Array.from(byMonth.keys()).sort((a, b) => a - b);
      return {
        labels: months.map((m) => MOIS_LABELS[m - 1].slice(0, 3)),
        datasets: [{
          label: "Courses",
          data: months.map((m) => byMonth.get(m) || 0),
          borderColor: TYPE_COLORS.achat,
          backgroundColor: TYPE_COLORS.achat + "22",
          pointBackgroundColor: TYPE_COLORS.achat,
          pointRadius: 5,
          tension: 0.3,
          fill: true,
          borderWidth: 2,
        }],
      };
    }

    // Monthly: one point per week
    return {
      labels: weeklyAchats.map((e) => (e.note || "").toUpperCase()),
      datasets: [{
        label: "Courses",
        data: weeklyAchats.map((e) => e.montant),
        borderColor: TYPE_COLORS.achat,
        backgroundColor: TYPE_COLORS.achat + "22",
        pointBackgroundColor: TYPE_COLORS.achat,
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        borderWidth: 2,
      }],
    };
  }, [entries, isAnnuel]);

  // --- Bar: charges by organisme ---
  const chargesData = useMemo(() => {
    const chargesEntries = entries.filter((e) => e.type === "charges");
    const chargesMap = new Map<string, number>();
    chargesEntries.forEach((e) => {
      const nom = e.organisme;
      chargesMap.set(nom, (chargesMap.get(nom) || 0) + e.montant);
    });
    const labels = Array.from(chargesMap.keys()).sort();
    const values = labels.map((l) => chargesMap.get(l) || 0);

    return {
      labels: labels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
      datasets: [{
        label: "Charges",
        data: values,
        backgroundColor: TYPE_COLORS.charges + "cc",
        borderRadius: 4,
      }],
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "var(--app-text-secondary)" }}>
        Pas de donnees pour afficher les graphiques.
      </div>
    );
  }

  const coursesTotal = entries
    .filter((e) => e.type === "achat")
    .reduce((s, e) => s + e.montant, 0);

  const hasCourses = coursesData.labels.length > 0;

  const chargesTitle = mois > 0 ? `Charges — ${MOIS_LABELS[mois - 1]} ${annee}` : `Charges — ${annee}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="chart-grid">
        {/* Left: Donut + mini courses (mensuel only) */}
        <div style={cardStyle}>
          <h3 style={chartTitleStyle}>Repartition par type</h3>
          <GraphJs
            type="doughnut"
            data={donutData}
            width={280}
            height={240}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { display: false } },
              cutout: "60%",
            }}
          />

          {/* Mini courses in left card — mensuel only */}
          {!isAnnuel && hasCourses && (
            <div style={{ width: "100%", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--app-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <h3 style={{ ...chartTitleStyle, margin: 0 }}>Courses</h3>
                <span style={{ fontSize: 13, fontWeight: 700, color: TYPE_COLORS.achat }}>
                  {coursesTotal.toLocaleString("fr-FR")} €
                </span>
              </div>
              <GraphJs
                type="line"
                data={coursesData}
                width={280}
                height={120}
                options={{ ...coursesChartOptions, responsive: true, maintainAspectRatio: true }}
              />
            </div>
          )}
        </div>

        {/* Right: balance bar + charges */}
        <div style={cardStyle}>
          {/* Balance bar */}
          <div style={{ width: "100%", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              <span style={{ color: "#6366f1" }}>Gael : {balance.gael.toLocaleString("fr-FR")} €</span>
              <span style={{ color: "#ec4899" }}>Enora : {balance.enora.toLocaleString("fr-FR")} €</span>
            </div>
            <div style={{ width: "100%", height: 10, borderRadius: 5, backgroundColor: "#f1f5f9", overflow: "hidden", display: "flex" }}>
              <div style={{
                width: `${balance.gaelPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #6366f1, #818cf8)",
                borderRadius: balance.gaelPct >= 100 ? 5 : "5px 0 0 5px",
                transition: "width 0.3s ease",
              }} />
              <div style={{
                flex: 1,
                height: "100%",
                background: "linear-gradient(90deg, #f472b6, #ec4899)",
                borderRadius: balance.gaelPct <= 0 ? 5 : "0 5px 5px 0",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          <h3 style={chartTitleStyle}>{chargesTitle}</h3>
          <div style={{ width: "100%", minWidth: 0 }}>
            <GraphJs
              type="bar"
              data={chargesData}
              width={650}
              height={300}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v: any) => `${v} €` },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Full-width courses — annuel only */}
      {isAnnuel && hasCourses && (
        <div style={{ ...cardStyle, marginTop: 16 }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 style={{ ...chartTitleStyle, margin: 0 }}>Courses — {annee}</h3>
            <span style={{ fontSize: 14, fontWeight: 700, color: TYPE_COLORS.achat }}>
              {coursesTotal.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div style={{ width: "100%", minWidth: 0 }}>
            <GraphJs
              type="line"
              data={coursesData}
              width={1000}
              height={180}
              options={{ ...coursesChartOptions, responsive: true, maintainAspectRatio: true }}
            />
          </div>
        </div>
      )}

      {/* Shared legend */}
      <div className="chart-legend">
        {[
          { label: "Revenus", color: TYPE_COLORS.revenu },
          { label: "Charges", color: TYPE_COLORS.charges },
          { label: "Achats / Courses", color: TYPE_COLORS.achat },
          { label: "Aides", color: TYPE_COLORS.aide },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "var(--app-text-secondary)", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const coursesChartOptions = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: {
      beginAtZero: true,
      ticks: { callback: (v: any) => `${v}€`, font: { size: 10 } },
      grid: { color: "#f1f5f9" },
    },
  },
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 12,
  border: "1px solid var(--app-border)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflow: "hidden",
  minWidth: 0,
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--app-text)",
  margin: "0 0 12px 0",
  textAlign: "center",
};
