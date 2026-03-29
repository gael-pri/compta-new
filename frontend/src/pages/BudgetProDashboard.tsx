import { useState, useEffect, useMemo, useCallback } from "react";
import { useBudgetPro } from "@hooks/useBudgetPro";
import { BudgetProEntry, BudgetProType, BudgetProFilters, CreateBudgetProInput, OrganismePro } from "@/core/types/budget-pro";
import { backend } from "@/core/backend";
import BudgetProBilan from "@components/budget/BudgetProBilan";
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, Eye, Paperclip, XCircle } from "lucide-react";
import { uploadFiles } from "@directus/sdk";
import { directusClient } from "@lib/directusClient";

const moisLabels = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

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

const types: { value: BudgetProType; label: string }[] = [
  { value: "recette", label: "Recette" },
  { value: "depense", label: "Depense" },
  { value: "dividendes", label: "Dividendes" },
  { value: "impots", label: "Impots" },
];

const moisOptions = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export default function BudgetProDashboard() {
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [filterType, setFilterType] = useState<BudgetProType | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<BudgetProEntry | null>(null);

  const filters: BudgetProFilters = {
    mois,
    annee,
    ...(filterType ? { type: filterType as BudgetProType } : {}),
  };

  const { entries, summary, loading, createEntry, updateEntry, deleteEntry } = useBudgetPro(filters);

  // Previous month for trend arrows
  const prevMois = mois === 1 ? 12 : mois - 1;
  const prevAnnee = mois === 1 ? annee - 1 : annee;
  const { summary: prevSummary } = useBudgetPro({ mois: prevMois, annee: prevAnnee });

  const handlePrevMonth = () => {
    if (mois === 1) { setMois(12); setAnnee(annee - 1); }
    else setMois(mois - 1);
  };

  const handleNextMonth = () => {
    if (mois === 12) { setMois(1); setAnnee(annee + 1); }
    else setMois(mois + 1);
  };

  const handleEdit = (entry: BudgetProEntry) => {
    setEditEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer cette entree ?")) {
      await deleteEntryWithTva(id);
    }
  };

  const handleToggleStatut = async (id: number, newStatut: string) => {
    await updateEntry(id, { statut: newStatut });
  };

  const handleFormSubmit = async (data: any) => {
    if (editEntry) {
      await updateEntryWithTva(editEntry.id, data, editEntry);
    } else {
      await createEntryWithTva(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditEntry(null);
  };

  // TVA cumul from compta_parameters
  const [tvaCumul, setTvaCumul] = useState(0);

  const fetchTvaCumul = useCallback(async () => {
    const param = await backend.comptaParams.get("tva_cumul");
    setTvaCumul(param?.value ?? 0);
  }, []);

  useEffect(() => { fetchTvaCumul(); }, [fetchTvaCumul]);

  // Recalculate full tva_cumul from all fiscal year entries and persist
  const recalcTvaCumul = useCallback(async () => {
    const fiscalStartYear = new Date().getMonth() >= 10 ? new Date().getFullYear() : new Date().getFullYear() - 1;
    const [entriesA, entriesB] = await Promise.all([
      backend.budgetPro.getAll({ annee: fiscalStartYear }),
      backend.budgetPro.getAll({ annee: fiscalStartYear + 1 }),
    ]);
    const fiscal = [
      ...entriesA.filter((e) => e.mois >= 11),
      ...entriesB.filter((e) => e.mois <= 10),
    ];
    let cumul = 0;
    for (const e of fiscal) {
      const tva = e.montant_ttc - e.montant_ht;
      if (e.type === "recette") cumul += tva;
      else if (e.type === "depense") cumul -= tva;
    }
    await backend.comptaParams.updateValue("tva_cumul", Math.round(cumul * 100) / 100);
    setTvaCumul(Math.round(cumul * 100) / 100);
  }, []);

  const createEntryWithTva = async (data: CreateBudgetProInput) => {
    await createEntry(data);
    await recalcTvaCumul();
  };

  const updateEntryWithTva = async (id: number, data: any, _oldEntry?: BudgetProEntry) => {
    await updateEntry(id, data);
    await recalcTvaCumul();
  };

  const deleteEntryWithTva = async (id: number) => {
    await deleteEntry(id);
    await recalcTvaCumul();
  };

  const [showPayTvaModal, setShowPayTvaModal] = useState(false);
  const [payTvaMontant, setPayTvaMontant] = useState("");

  const handlePayTva = async () => {
    const montant = parseFloat(payTvaMontant);
    if (isNaN(montant) || montant <= 0) return;

    // Find or create "TVA" organisme
    let orgs = await backend.organismePro.getAll();
    let tvaOrg = orgs.find((o) => o.nom.toLowerCase() === "tva");
    if (!tvaOrg) {
      tvaOrg = await backend.organismePro.create("TVA", "depense");
    }
    await createEntry({
      type: "depense",
      organisme_id: tvaOrg.id,
      montant_ht: montant,
      tva: 0,
      montant_ttc: montant,
      jour: new Date().getDate(),
      mois,
      annee,
      note: `Reglement TVA ${moisLabels[mois - 1]} ${annee}`,
      statut: "valide",
    });
    // Deduct from cumul
    await backend.comptaParams.updateValue("tva_cumul", tvaCumul - montant);
    await fetchTvaCumul();
    setShowPayTvaModal(false);
  };

  const recettes = entries.filter((e) => e.type === "recette");
  const depenses = entries.filter((e) => e.type === "depense");
  const dividendes = entries.filter((e) => e.type === "dividendes");
  const impots = entries.filter((e) => e.type === "impots");

  const tables = [
    { title: "Recettes", entries: recettes, color: TYPE_COLORS.recette },
    { title: "Depenses", entries: depenses, color: TYPE_COLORS.depense },
    { title: "Dividendes", entries: dividendes, color: TYPE_COLORS.dividendes },
    { title: "Impots", entries: impots, color: TYPE_COLORS.impots },
  ].filter((t) => t.entries.length > 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Budget Pro mensuel</h1>
          <p style={{ color: "var(--app-text-secondary)", margin: "4px 0 0", fontSize: 14 }}>
            Suivi des recettes et depenses professionnelles
          </p>
        </div>
        <div className="page-header-actions">
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
            <SummaryCard label="Recettes HT" value={summary.totalRecettes} color={TYPE_COLORS.recette} bg={TYPE_BG.recette} prev={prevSummary?.totalRecettes} positive />
            <SummaryCard label="Depenses HT" value={summary.totalDepenses} color={TYPE_COLORS.depense} bg={TYPE_BG.depense} prev={prevSummary?.totalDepenses} positive={false} />
            <SummaryCard label="TVA collectee" value={summary.totalTvaCollectee} color={TYPE_COLORS.recette} bg={TYPE_BG.recette} />
            <SummaryCard label="TVA deductible" value={summary.totalTvaDeductible} color={TYPE_COLORS.depense} bg={TYPE_BG.depense} />
            <SummaryCard
              label="Solde HT"
              value={summary.solde}
              color={summary.solde >= 0 ? TYPE_COLORS.recette : TYPE_COLORS.depense}
              bg={summary.solde >= 0 ? TYPE_BG.recette : TYPE_BG.depense}
              prefix={summary.solde >= 0 ? "+" : ""}
              prev={prevSummary?.soldeHT}
              positive
            />
          </div>

          {/* Bilan mensuel */}
          <BudgetProBilan
            entries={entries}
            tvaCumul={tvaCumul}
            onPayTva={() => { setPayTvaMontant(String(Math.max(tvaCumul, 0))); setShowPayTvaModal(true); }}
            mois={mois}
            annee={annee}
          />

          {/* Tables by type */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {tables.map((t) => (
              <ProTable
                key={t.title}
                title={t.title}
                entries={t.entries}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatut={handleToggleStatut}
                accentColor={t.color}
              />
            ))}
          </div>
        </>
      )}

      {showForm && (
        <BudgetProForm
          entry={editEntry}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {/* Modale paiement TVA */}
      {showPayTvaModal && (
        <div className="modal-overlay" onClick={() => setShowPayTvaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Payer la TVA</h2>
            <p style={{ fontSize: 13, color: "var(--app-text-secondary)", margin: "0 0 16px" }}>
              Solde TVA actuel : <strong style={{ color: "#ef4444" }}>{Math.round(tvaCumul).toLocaleString("fr-FR")} €</strong>
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--app-text-secondary)", display: "block", marginBottom: 4 }}>
                Montant a payer (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={payTvaMontant}
                onChange={(e) => setPayTvaMontant(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--app-border)", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" as const }}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handlePayTva(); }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowPayTvaModal(false)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--app-border)", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Annuler
              </button>
              <button
                onClick={handlePayTva}
                disabled={!payTvaMontant || parseFloat(payTvaMontant) <= 0}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--app-primary)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: !payTvaMontant || parseFloat(payTvaMontant) <= 0 ? 0.5 : 1 }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
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
  prev,
  positive,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  prefix?: string;
  prev?: number;
  positive?: boolean;
}) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "20px 24px", border: `1px solid ${color}22` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--app-text-secondary)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color }}>
          {prefix}{value.toLocaleString("fr-FR")} €
        </span>
        {prev !== undefined && positive !== undefined && (
          <TrendArrow current={value} previous={prev} positive={positive} />
        )}
      </div>
    </div>
  );
}

function TrendArrow({ current, previous, positive }: { current: number; previous: number; positive: boolean }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  const isUp = diff > 0;
  const isEqual = diff === 0;

  let color: string;
  if (isEqual) {
    color = "#3b82f6";
  } else {
    const isGood = positive ? isUp : !isUp;
    color = isGood ? "#22c55e" : "#ef4444";
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
      fontSize: 11,
      color,
    }}>
      {isEqual ? "=" : isUp ? "↑" : "↓"}
    </div>
  );
}

/* ─── Pro Table ─── */

function ProTable({
  title,
  entries,
  onEdit,
  onDelete,
  onToggleStatut,
  accentColor,
}: {
  title: string;
  entries: BudgetProEntry[];
  onEdit: (entry: BudgetProEntry) => void;
  onDelete: (id: number) => void;
  onToggleStatut: (id: number, newStatut: string) => void;
  accentColor: string;
}) {
  const totalHT = entries.reduce((s, e) => s + e.montant_ht, 0);

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--app-border)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid var(--app-border)" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
          {totalHT.toLocaleString("fr-FR")} € HT
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
                <th style={{ ...thStyle, width: 32, textAlign: "center" }}></th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Organisme</th>
                <th style={thStyle}>Note</th>
                <th style={{ ...thStyle, textAlign: "right" }}>HT</th>
                <th style={{ ...thStyle, textAlign: "right" }}>TVA%</th>
                <th style={{ ...thStyle, ...stickyTTCStyle, textAlign: "right" }}>TTC</th>
                <th style={{ ...thStyle, width: 32, textAlign: "center" }}>PJ</th>
                <th style={{ ...thStyle, ...stickyActionsStyle, textAlign: "right", width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid var(--app-border)" }}>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => onToggleStatut(entry.id, entry.statut === "valide" ? "en_attente" : "valide")}
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
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: TYPE_COLORS[entry.type],
                      backgroundColor: TYPE_BG[entry.type],
                    }}>
                      {TYPE_LABELS[entry.type]}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500, textTransform: "capitalize" }}>{entry.organisme}</td>
                  <td style={{ ...tdStyle, color: "var(--app-text-secondary)" }}>{entry.note || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {entry.montant_ht.toLocaleString("fr-FR")} €
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "var(--app-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                    {entry.tva}%
                  </td>
                  <td style={{ ...tdStyle, ...stickyTTCStyle, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {entry.montant_ttc.toLocaleString("fr-FR")} €
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {entry.piece_jointe ? (
                      <a
                        href={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${entry.piece_jointe}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...actionBtn, color: "var(--app-primary)", display: "inline-flex" }}
                        title="Voir la piece jointe"
                      >
                        <Eye size={16} />
                      </a>
                    ) : (
                      <span style={{ color: "var(--app-border)" }}>—</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, ...stickyActionsStyle, textAlign: "right" }}>
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

/* ─── Budget Pro Form (inline modal) ─── */

function BudgetProForm({
  entry,
  onSubmit,
  onClose,
}: {
  entry?: BudgetProEntry | null;
  onSubmit: (data: CreateBudgetProInput) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = !!entry;

  const [type, setType] = useState<BudgetProType>(entry?.type || "depense");
  const [organismeId, setOrganismeId] = useState<number | "">(
    entry?.organisme_id && typeof entry.organisme_id === "object" ? entry.organisme_id.id : ""
  );
  const [montantHT, setMontantHT] = useState(entry?.montant_ht?.toString() || "");
  const [tva, setTva] = useState(entry?.tva?.toString() || "20");
  const [montantTTC, setMontantTTC] = useState(entry?.montant_ttc?.toString() || "");
  const [jour, setJour] = useState(entry?.jour || new Date().getDate());
  const [mois, setMois] = useState(entry?.mois || new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(entry?.annee || new Date().getFullYear());
  const [note, setNote] = useState(entry?.note || "");
  const [argentAvance, setArgentAvance] = useState(entry?.argent_avance?.toString() || "0");
  const [statut, setStatut] = useState(entry?.statut || "valide");
  const [pieceJointe, setPieceJointe] = useState<string | null>(entry?.piece_jointe ?? null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Organismes
  const [organismes, setOrganismes] = useState<OrganismePro[]>([]);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [newOrgNom, setNewOrgNom] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);

  useEffect(() => {
    backend.organismePro.getAll().then(setOrganismes);
  }, []);

  useEffect(() => {
    if (entry) {
      setType(entry.type);
      setOrganismeId(
        entry.organisme_id && typeof entry.organisme_id === "object" ? entry.organisme_id.id : ""
      );
      setMontantHT(entry.montant_ht.toString());
      setTva(entry.tva.toString());
      setMontantTTC(entry.montant_ttc.toString());
      setJour(entry.jour || 1);
      setMois(entry.mois);
      setAnnee(entry.annee);
      setNote(entry.note || "");
      setArgentAvance(entry.argent_avance?.toString() || "0");
      setStatut(entry.statut || "valide");
      setPieceJointe(entry.piece_jointe ?? null);
    }
  }, [entry]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await directusClient.request(uploadFiles(formData));
      setPieceJointe(uploaded.id);
    } catch {
      alert("Erreur lors de l'upload du fichier");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setPieceJointe(null);
  };

  // Auto-calculate TTC when HT or TVA changes
  useEffect(() => {
    const ht = parseFloat(montantHT);
    const tvaRate = parseFloat(tva);
    if (!isNaN(ht) && !isNaN(tvaRate)) {
      const ttc = ht * (1 + tvaRate / 100);
      setMontantTTC(ttc.toFixed(2));
    }
  }, [montantHT, tva]);

  // Filter organismes by selected type
  const filteredOrganismes = organismes.filter((o) => o.type === type);

  // Reset organisme selection when type changes
  useEffect(() => {
    if (organismeId && typeof organismeId === "number") {
      const current = organismes.find((o) => o.id === organismeId);
      if (current && current.type !== type) {
        setOrganismeId("");
      }
    }
  }, [type, organismes, organismeId]);

  const handleCreateOrganisme = async () => {
    if (!newOrgNom.trim()) return;
    setCreatingOrg(true);
    try {
      const created = await backend.organismePro.create(newOrgNom.trim(), type);
      setOrganismes((prev) => [...prev, created]);
      setOrganismeId(created.id);
      setNewOrgNom("");
      setShowNewOrg(false);
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organismeId || !montantHT) return;

    const selectedOrg = organismes.find((o) => o.id === organismeId);
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        organisme: selectedOrg?.nom.toLowerCase() || "",
        organisme_id: organismeId as number,
        montant_ht: parseFloat(montantHT),
        tva: parseFloat(tva),
        montant_ttc: parseFloat(montantTTC),
        jour,
        mois,
        annee,
        note: note || null,
        statut,
        argent_avance: parseFloat(argentAvance) || 0,
        piece_jointe: pieceJointe,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isEdit ? "Modifier l'entree pro" : "Nouvelle entree pro"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color="var(--app-text-secondary)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Type */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  style={{
                    ...chipStyle,
                    backgroundColor: type === t.value ? TYPE_COLORS[t.value] : "var(--app-bg)",
                    color: type === t.value ? "white" : "var(--app-text-secondary)",
                    border: `1px solid ${type === t.value ? "transparent" : "var(--app-border)"}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Organisme */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Organisme</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={organismeId}
                onChange={(e) => setOrganismeId(e.target.value ? Number(e.target.value) : "")}
                required
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="">Selectionner...</option>
                {filteredOrganismes.map((o) => (
                  <option key={o.id} value={o.id}>{o.nom}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewOrg(!showNewOrg)}
                style={addOrgBtnStyle}
                title="Nouvel organisme"
              >
                <Plus size={18} />
              </button>
            </div>

            {showNewOrg && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  value={newOrgNom}
                  onChange={(e) => setNewOrgNom(e.target.value)}
                  placeholder={`Nom du nouvel organisme (${type})`}
                  style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateOrganisme(); } }}
                />
                <button
                  type="button"
                  onClick={handleCreateOrganisme}
                  disabled={creatingOrg || !newOrgNom.trim()}
                  style={{
                    ...submitStyle,
                    padding: "8px 16px",
                    marginTop: 0,
                    fontSize: 13,
                    opacity: creatingOrg || !newOrgNom.trim() ? 0.5 : 1,
                  }}
                >
                  {creatingOrg ? "..." : "Creer"}
                </button>
              </div>
            )}
          </div>

          {/* Montant HT + TVA + TTC */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Montant HT (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montantHT}
                onChange={(e) => setMontantHT(e.target.value)}
                placeholder="0.00"
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>TVA %</label>
              <input
                type="text"
                inputMode="decimal"
                value={tva}
                onChange={(e) => setTva(e.target.value.replace(",", "."))}
                placeholder="20"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Montant TTC (€)</label>
              <input
                type="number"
                step="0.01"
                value={montantTTC}
                readOnly
                style={{ ...inputStyle, backgroundColor: "var(--app-bg)", color: "var(--app-text-secondary)" }}
              />
            </div>
          </div>

          {/* Jour + Mois + Annee */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Jour</label>
              <input
                type="number"
                min="1"
                max="31"
                value={jour}
                onChange={(e) => setJour(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Mois</label>
              <select value={mois} onChange={(e) => setMois(Number(e.target.value))} style={inputStyle}>
                {moisOptions.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Annee</label>
              <input
                type="number"
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Note */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Note (optionnel)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detail, commentaire..."
              style={inputStyle}
            />
          </div>

          {/* Argent avance + Statut */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Argent avance (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={argentAvance}
                onChange={(e) => setArgentAvance(e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Statut</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)} style={inputStyle}>
                <option value="valide">Valide</option>
                <option value="en_attente">En attente</option>
                <option value="annule">Annule</option>
              </select>
            </div>
          </div>

          {/* Piece jointe */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Piece jointe (optionnel)</label>
            {pieceJointe ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a
                  href={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${pieceJointe}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--app-primary)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                >
                  <Paperclip size={14} />
                  Voir le fichier
                </a>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--app-error)", display: "flex", alignItems: "center" }}
                  title="Supprimer la piece jointe"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }}
              />
            )}
            {uploadingFile && (
              <span style={{ fontSize: 12, color: "var(--app-text-secondary)" }}>Upload en cours...</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !organismeId || !montantHT}
            style={{
              ...submitStyle,
              opacity: submitting || !organismeId || !montantHT ? 0.5 : 1,
            }}
          >
            {submitting ? "..." : isEdit ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Styles ─── */

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

const stickyTTCStyle: React.CSSProperties = {
  position: "sticky",
  right: 80,
  background: "white",
  boxShadow: "-4px 0 8px rgba(0,0,0,0.04)",
};

const stickyActionsStyle: React.CSSProperties = {
  position: "sticky",
  right: 0,
  background: "white",
};

const actionBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  color: "var(--app-text-secondary)",
  borderRadius: 4,
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--app-text-secondary)",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--app-border)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  minWidth: 0,
  width: "100%",
  boxSizing: "border-box",
};

const chipStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const submitStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: 10,
  border: "none",
  backgroundColor: "var(--app-primary)",
  color: "white",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
  marginTop: 8,
};

const addOrgBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: 8,
  border: "1px solid var(--app-border)",
  background: "white",
  cursor: "pointer",
  color: "var(--app-primary)",
  flexShrink: 0,
};
