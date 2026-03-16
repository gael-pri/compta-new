import { useState } from "react";
import { useBudget } from "@hooks/useBudget";
import { BudgetEntry, BudgetType, BudgetFilters } from "@/core/types/budget";
import BudgetSummary from "@components/budget/BudgetSummary";
import BudgetTable from "@components/budget/BudgetTable";
import BudgetForm from "@components/budget/BudgetForm";
import BudgetChart from "@components/budget/BudgetChart";
import { Plus, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

const moisLabels = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export default function BudgetDashboard() {
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [filterType, setFilterType] = useState<BudgetType | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<BudgetEntry | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  const filters: BudgetFilters = {
    mois,
    annee,
    ...(filterType ? { type: filterType as BudgetType } : {}),
  };

  const { entries, summary, loading, createEntry, updateEntry, deleteEntry } = useBudget(filters);

  // Previous month for trend arrows
  const prevMois = mois === 1 ? 12 : mois - 1;
  const prevAnnee = mois === 1 ? annee - 1 : annee;
  const { summary: prevSummary } = useBudget({ mois: prevMois, annee: prevAnnee });

  const handlePrevMonth = () => {
    if (mois === 1) { setMois(12); setAnnee(annee - 1); }
    else setMois(mois - 1);
  };

  const handleNextMonth = () => {
    if (mois === 12) { setMois(1); setAnnee(annee + 1); }
    else setMois(mois + 1);
  };

  const handleEdit = (entry: BudgetEntry) => {
    setEditEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer cette entree ?")) {
      await deleteEntry(id);
    }
  };

  const handleToggleStatut = async (id: number, newStatut: string) => {
    await updateEntry(id, { statut: newStatut });
  };

  const handleFormSubmit = async (data: any) => {
    if (editEntry) {
      await updateEntry(editEntry.id, data);
    } else {
      await createEntry(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditEntry(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Budget mensuel</h1>
          <p style={{ color: "var(--app-text-secondary)", margin: "4px 0 0", fontSize: 14 }}>
            Suivi des revenus et depenses
          </p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={() => setShowCharts(!showCharts)}
            style={{
              ...navBtnStyle,
              width: "auto",
              padding: "10px 16px",
              gap: 6,
              display: "flex",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              backgroundColor: showCharts ? "var(--app-primary)" : "white",
              color: showCharts ? "white" : "var(--app-text)",
              border: showCharts ? "1px solid var(--app-primary)" : "1px solid var(--app-border)",
            }}
          >
            <BarChart3 size={18} />
            Graphiques
          </button>
          <button
            onClick={() => { setEditEntry(null); setShowForm(true); }}
            style={addBtnStyle}
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Month navigator */}
      <div className="page-nav">
        <button onClick={handlePrevMonth} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: 16, fontWeight: 600, minWidth: 160, textAlign: "center" }}>
          {moisLabels[mois - 1]} {annee}
        </span>
        <button onClick={handleNextMonth} style={navBtnStyle}><ChevronRight size={18} /></button>

        {/* Type filter */}
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
          <BudgetSummary summary={summary} prevSummary={prevSummary} />

          {showCharts && <BudgetChart entries={entries} mois={mois} annee={annee} />}

          <BudgetTable entries={entries} onEdit={handleEdit} onDelete={handleDelete} onToggleStatut={handleToggleStatut} />
        </>
      )}

      {showForm && (
        <BudgetForm
          entry={editEntry}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

const addBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  backgroundColor: "var(--app-primary)",
  color: "white",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

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
