import { useState, useEffect } from "react";
import { BudgetEntry, BudgetType, CreateBudgetInput, Organisme } from "@/core/types/budget";
import { backend } from "@/core/backend";
import { X, Plus } from "lucide-react";

interface Props {
  entry?: BudgetEntry | null;
  onSubmit: (data: CreateBudgetInput) => Promise<void>;
  onClose: () => void;
}

const types: { value: BudgetType; label: string }[] = [
  { value: "revenu", label: "Revenu" },
  { value: "charges", label: "Charges" },
  { value: "achat", label: "Achat" },
  { value: "aide", label: "Aide" },
];

const moisOptions = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export default function BudgetForm({ entry, onSubmit, onClose }: Props) {
  const isEdit = !!entry;

  const [type, setType] = useState<BudgetType>(entry?.type || "charges");
  const [organismeId, setOrganismeId] = useState<number | "">(
    entry?.organisme_id && typeof entry.organisme_id === "object" ? entry.organisme_id.id : ""
  );
  const [montant, setMontant] = useState(entry?.montant?.toString() || "");
  const [mois, setMois] = useState(entry?.mois || new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(entry?.annee || new Date().getFullYear());
  const [note, setNote] = useState(entry?.note || "");
  const [statut, setStatut] = useState(entry?.statut || "valide");
  const [submitting, setSubmitting] = useState(false);

  // Organismes
  const [organismes, setOrganismes] = useState<Organisme[]>([]);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [newOrgNom, setNewOrgNom] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);

  useEffect(() => {
    backend.organisme.getAll().then(setOrganismes);
  }, []);

  useEffect(() => {
    if (entry) {
      setType(entry.type);
      setOrganismeId(
        entry.organisme_id && typeof entry.organisme_id === "object" ? entry.organisme_id.id : ""
      );
      setMontant(entry.montant.toString());
      setMois(entry.mois);
      setAnnee(entry.annee);
      setNote(entry.note || "");
      setStatut(entry.statut || "valide");
    }
  }, [entry]);

  // Filter organismes by selected type
  const filteredOrganismes = organismes.filter((o) => o.type === type);

  // Reset organisme selection when type changes (if current selection doesn't match)
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
      const created = await backend.organisme.create(newOrgNom.trim(), type);
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
    if (!organismeId || !montant) return;

    const selectedOrg = organismes.find((o) => o.id === organismeId);
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        organisme: selectedOrg?.nom.toLowerCase() || "",
        organisme_id: organismeId as number,
        montant: parseFloat(montant),
        mois,
        annee,
        note: note || null,
        statut,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isEdit ? "Modifier l'entree" : "Nouvelle entree"}
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
                    backgroundColor: type === t.value ? `var(--budget-${t.value})` : "var(--app-bg)",
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

            {/* New organisme inline form */}
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

          {/* Montant */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Montant (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0.00"
              required
              style={inputStyle}
            />
          </div>

          {/* Mois + Annee */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              placeholder="Detail, semaine, commentaire..."
              style={inputStyle}
            />
          </div>

          {/* Statut */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value)} style={inputStyle}>
              <option value="valide">Valide</option>
              <option value="en_attente">En attente</option>
              <option value="annule">Annule</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !organismeId || !montant}
            style={{
              ...submitStyle,
              opacity: submitting || !organismeId || !montant ? 0.5 : 1,
            }}
          >
            {submitting ? "..." : isEdit ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 32,
  width: "100%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
