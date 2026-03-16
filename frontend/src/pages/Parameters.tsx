import { useState, useEffect, useCallback } from "react";
import { User } from "@/core/types/user";
import { Organisme, BudgetType } from "@/core/types/budget";
import { Prevision, CreatePrevisionInput } from "@/core/types/prevision";
import { OrganismePro, BudgetProType, PrevisionPro, CreatePrevisionProInput } from "@/core/types/budget-pro";
import { backend } from "@/core/backend";
import { useAlert } from "@context/AlertContext";
import { useGetAllUsers } from "@hooks/useUsers";
import AccountParameters from "@components/authentication/AccountParameters/AccountParameters";
import UserCrud from "@components/authentication/UserCrud/UserCrud";
import { Plus, Pencil, Trash2, Check, X, Play, Loader2 } from "lucide-react";

const TABS = [
  { key: "organismes", label: "Organismes" },
  { key: "previsions", label: "Previsions" },
  { key: "profil", label: "Mon profil" },
  { key: "admin", label: "Admin Profiles" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TYPE_LABELS: Record<BudgetType, string> = {
  revenu: "Revenus",
  charges: "Charges",
  achat: "Achats",
  aide: "Aides",
};

const TYPE_COLORS: Record<string, string> = {
  revenu: "var(--budget-revenu)",
  charges: "var(--budget-charges)",
  achat: "var(--budget-achat)",
  aide: "var(--budget-aide)",
  recette: "#22c55e",
  depense: "#ef4444",
  dividendes: "#f59e0b",
  impots: "#8b5cf6",
};

const BUDGET_TYPES: BudgetType[] = ["revenu", "charges", "achat", "aide"];

const TYPE_LABELS_PRO: Record<BudgetProType, string> = {
  recette: "Recettes",
  depense: "Depenses",
  dividendes: "Dividendes",
  impots: "Impots",
};

const BUDGET_PRO_TYPES: BudgetProType[] = ["recette", "depense", "dividendes", "impots"];

type BudgetMode = "perso" | "pro";

function ModeToggle({ mode, setMode }: { mode: BudgetMode; setMode: (m: BudgetMode) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--app-bg)", borderRadius: 8, padding: 3, marginBottom: 16 }}>
      {(["perso", "pro"] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            background: mode === m ? "white" : "transparent",
            color: mode === m ? "var(--app-text)" : "var(--app-text-secondary)",
            boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          {m === "perso" ? "Perso" : "Pro"}
        </button>
      ))}
    </div>
  );
}

export default function Parameters({ user }: { user: User }) {
  const [tab, setTab] = useState<TabKey>("organismes");
  const [mode, setMode] = useState<BudgetMode>("perso");

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Parametres</h1>
        <p style={{ color: "var(--app-text-secondary)", margin: "4px 0 0", fontSize: 14 }}>
          Configurer l'application
        </p>
      </div>

      {/* Tabs */}
      <div style={tabBarStyle}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...tabBtnStyle,
              borderBottomColor: tab === t.key ? "var(--app-primary)" : "transparent",
              color: tab === t.key ? "var(--app-primary)" : "var(--app-text-secondary)",
              fontWeight: tab === t.key ? 700 : 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ marginTop: 24 }}>
        {tab === "organismes" && <OrganismesTab mode={mode} setMode={setMode} />}
        {tab === "previsions" && <PrevisionsTab mode={mode} setMode={setMode} />}
        {tab === "profil" && <ProfilTab user={user} />}
        {tab === "admin" && <AdminTab user={user} />}
      </div>
    </div>
  );
}

// ─── ORGANISMES TAB ──────────────────────────────────────────────────────────

function OrganismesTab({ mode, setMode }: { mode: BudgetMode; setMode: (m: BudgetMode) => void }) {
  const [organismes, setOrganismes] = useState<(Organisme | OrganismePro)[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState("");
  const [newNom, setNewNom] = useState("");
  const [newType, setNewType] = useState<string>(mode === "perso" ? "charges" : "depense");
  const [showAdd, setShowAdd] = useState(false);
  const { addAlert } = useAlert();

  const service = mode === "perso" ? backend.organisme : backend.organismePro;
  const types = mode === "perso" ? BUDGET_TYPES : BUDGET_PRO_TYPES;
  const labels = mode === "perso" ? TYPE_LABELS : TYPE_LABELS_PRO;

  const fetchOrganismes = useCallback(async () => {
    setLoading(true);
    const data = await service.getAll();
    setOrganismes(data);
    setLoading(false);
  }, [mode]);

  useEffect(() => { fetchOrganismes(); }, [fetchOrganismes]);
  useEffect(() => { setNewType(mode === "perso" ? "charges" : "depense"); setShowAdd(false); }, [mode]);

  const handleCreate = async () => {
    if (!newNom.trim()) return;
    await service.create(newNom.trim(), newType as any);
    setNewNom("");
    setShowAdd(false);
    addAlert("success", "Organisme cree");
    fetchOrganismes();
  };

  const handleUpdate = async (id: number) => {
    if (!editNom.trim()) return;
    await service.update(id, { nom: editNom.trim() });
    setEditingId(null);
    addAlert("success", "Organisme modifie");
    fetchOrganismes();
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!window.confirm(`Supprimer l'organisme "${nom}" ?`)) return;
    try {
      await service.delete(id);
      addAlert("success", "Organisme supprime");
      fetchOrganismes();
    } catch {
      addAlert("error", "Impossible de supprimer : organisme utilise dans des entrees budget");
    }
  };

  if (loading) return <p style={{ color: "var(--app-text-secondary)" }}>Chargement...</p>;

  const grouped = types.reduce((acc, type) => {
    acc[type] = organismes.filter((o) => o.type === type);
    return acc;
  }, {} as Record<string, (Organisme | OrganismePro)[]>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ModeToggle mode={mode} setMode={setMode} />
        <button onClick={() => setShowAdd(!showAdd)} style={primaryBtnStyle}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {showAdd && (
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nom</label>
              <input
                value={newNom}
                onChange={(e) => setNewNom(e.target.value)}
                placeholder="Nom de l'organisme"
                style={inputStyle}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)} style={inputStyle}>
                {types.map((t) => (
                  <option key={t} value={t}>{labels[t as keyof typeof labels]}</option>
                ))}
              </select>
            </div>
            <button onClick={handleCreate} disabled={!newNom.trim()} style={{ ...primaryBtnStyle, opacity: newNom.trim() ? 1 : 0.5 }}>
              Creer
            </button>
          </div>
        </div>
      )}

      {types.map((type) => (
        <div key={type} style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS[type], display: "inline-block" }} />
            {labels[type as keyof typeof labels]}
            <span style={{ fontWeight: 400, color: "var(--app-text-secondary)", fontSize: 13 }}>({(grouped[type] || []).length})</span>
          </h3>

          {grouped[type].length === 0 ? (
            <p style={{ color: "var(--app-text-secondary)", fontSize: 13 }}>Aucun organisme</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {grouped[type].map((org) => (
                <div key={org.id} style={rowStyle}>
                  {editingId === org.id ? (
                    <>
                      <input
                        value={editNom}
                        onChange={(e) => setEditNom(e.target.value)}
                        style={{ ...inputStyle, flex: 1, padding: "6px 10px", fontSize: 13 }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(org.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button onClick={() => handleUpdate(org.id)} style={iconBtnStyle}><Check size={16} color="var(--app-success)" /></button>
                      <button onClick={() => setEditingId(null)} style={iconBtnStyle}><X size={16} color="var(--app-text-secondary)" /></button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 14 }}>{org.nom}</span>
                      <button onClick={() => { setEditingId(org.id); setEditNom(org.nom); }} style={iconBtnStyle}>
                        <Pencil size={14} color="var(--app-text-secondary)" />
                      </button>
                      <button onClick={() => handleDelete(org.id, org.nom)} style={iconBtnStyle}>
                        <Trash2 size={14} color="var(--app-error)" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PREVISIONS TAB ──────────────────────────────────────────────────────────

function PrevisionsTab({ mode, setMode }: { mode: BudgetMode; setMode: (m: BudgetMode) => void }) {
  const [previsions, setPrevisions] = useState<any[]>([]);
  const [organismes, setOrganismes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMontant, setEditMontant] = useState("");
  const [editNote, setEditNote] = useState("");
  const { addAlert } = useAlert();

  const isPro = mode === "pro";
  const types = isPro ? BUDGET_PRO_TYPES : BUDGET_TYPES;
  const labels: Record<string, string> = isPro ? TYPE_LABELS_PRO : TYPE_LABELS;
  const prevService = isPro ? backend.previsionPro : backend.prevision;
  const orgService = isPro ? backend.organismePro : backend.organisme;
  const budgetService = isPro ? backend.budgetPro : backend.budget;

  // New form state
  const [newType, setNewType] = useState<string>(isPro ? "depense" : "charges");
  const [newOrgId, setNewOrgId] = useState<number | "">("");
  const [newNote, setNewNote] = useState("");
  const [newMontant, setNewMontant] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [p, o] = await Promise.all([prevService.getAll(), orgService.getAll()]);
    setPrevisions(p);
    setOrganismes(o);
    setLoading(false);
  }, [mode]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setNewType(isPro ? "depense" : "charges"); setShowAdd(false); }, [mode]);

  const getOrgName = (p: any) => {
    if (p.organisme_id && typeof p.organisme_id === "object") return p.organisme_id.nom;
    const org = organismes.find((o) => o.id === p.organisme_id);
    return org?.nom || "—";
  };

  const handleCreate = async () => {
    if (!newOrgId || !newMontant) return;
    const montant = parseFloat(newMontant);
    if (isPro) {
      await prevService.create({
        type: newType as any,
        organisme_id: newOrgId as number,
        note: newNote || null,
        montant_ht: montant,
        tva: 20,
        montant_ttc: montant * 1.2,
      });
    } else {
      await prevService.create({
        type: newType as any,
        organisme_id: newOrgId as number,
        note: newNote || null,
        montant,
      } as any);
    }
    setNewMontant("");
    setNewNote("");
    setNewOrgId("");
    setShowAdd(false);
    addAlert("success", "Prevision creee");
    fetchAll();
  };

  const handleUpdate = async (id: number) => {
    const montant = parseFloat(editMontant);
    const updateData: any = { note: editNote || null };
    if (isPro) {
      updateData.montant_ht = montant;
      updateData.montant_ttc = montant * 1.2;
    } else {
      updateData.montant = montant;
    }
    await prevService.update(id, updateData);
    setEditingId(null);
    addAlert("success", "Prevision modifiee");
    fetchAll();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette prevision ?")) return;
    await prevService.delete(id);
    addAlert("success", "Prevision supprimee");
    fetchAll();
  };

  const handleApply = async () => {
    if (!window.confirm("Appliquer les previsions sur les mois restants de l'annee en cours ?\n\nCela va creer ou mettre a jour les entrees 'en_attente'.")) return;
    setApplying(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Get all existing budget entries for remaining months
      const allEntries = await budgetService.getAll({ annee: currentYear });

      let created = 0;
      let updated = 0;

      for (let mois = currentMonth; mois <= 12; mois++) {
        for (const prev of previsions) {
          const orgId = typeof prev.organisme_id === "object" ? prev.organisme_id?.id : prev.organisme_id;
          if (!orgId) continue;

          const org = organismes.find((o) => o.id === orgId);
          if (!org) continue;

          // Find matching existing entry
          const existing = allEntries.find((e) => {
            const eOrgId = typeof e.organisme_id === "object" ? e.organisme_id?.id : e.organisme_id;
            return e.type === prev.type
              && eOrgId === orgId
              && (e.note || "") === (prev.note || "")
              && e.mois === mois;
          });

          if (!existing) {
            // Create new entry with statut "en_attente"
            const createData: any = {
              type: prev.type,
              organisme_id: orgId,
              mois,
              annee: currentYear,
              note: prev.note,
              statut: "en_attente",
            };
            if (isPro) {
              createData.montant_ht = prev.montant_ht;
              createData.tva = prev.tva;
              createData.montant_ttc = prev.montant_ttc;
            } else {
              createData.organisme = org.nom.toLowerCase();
              createData.montant = prev.montant;
            }
            await budgetService.create(createData);
            created++;
          } else if (existing.statut === "en_attente") {
            const updateData: any = isPro
              ? { montant_ht: prev.montant_ht, montant_ttc: prev.montant_ttc }
              : { montant: prev.montant };
            await budgetService.update(existing.id, updateData);
            updated++;
          }
          // If statut === "valide" → skip
        }
      }

      addAlert("success", `Previsions appliquees : ${created} creees, ${updated} mises a jour`);
    } catch (err) {
      addAlert("error", "Erreur lors de l'application des previsions");
    } finally {
      setApplying(false);
    }
  };

  const filteredNewOrgs = organismes.filter((o) => o.type === newType);

  if (loading) return <p style={{ color: "var(--app-text-secondary)" }}>Chargement...</p>;

  const grouped = types.reduce((acc, type) => {
    acc[type] = previsions.filter((p: any) => p.type === type);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <ModeToggle mode={mode} setMode={setMode} />
        <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowAdd(!showAdd)} style={primaryBtnStyle}>
          <Plus size={16} /> Ajouter
        </button>
        <button onClick={handleApply} disabled={applying || previsions.length === 0} style={{
          ...primaryBtnStyle,
          backgroundColor: "var(--budget-revenu)",
          opacity: applying || previsions.length === 0 ? 0.5 : 1,
        }}>
          {applying ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={16} />}
          Appliquer les previsions
        </button>
        </div>
      </div>

      {showAdd && (
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={newType} onChange={(e) => { setNewType(e.target.value); setNewOrgId(""); }} style={inputStyle}>
                {types.map((t) => (
                  <option key={t} value={t}>{labels[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Organisme</label>
              <select value={newOrgId} onChange={(e) => setNewOrgId(e.target.value ? Number(e.target.value) : "")} style={inputStyle} required>
                <option value="">Selectionner...</option>
                {filteredNewOrgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Note</label>
              <input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="S1, mensuel..." style={{ ...inputStyle, width: 120 }} />
            </div>
            <div>
              <label style={labelStyle}>Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={newMontant}
                onChange={(e) => setNewMontant(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, width: 100 }}
              />
            </div>
            <button onClick={handleCreate} disabled={!newOrgId || !newMontant} style={{ ...primaryBtnStyle, opacity: newOrgId && newMontant ? 1 : 0.5 }}>
              Creer
            </button>
          </div>
        </div>
      )}

      {types.map((type) => (
        (grouped[type] || []).length > 0 && (
          <div key={type} style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS[type], display: "inline-block" }} />
              {labels[type]}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: "8px 16px", alignItems: "center" }}>
              {/* Header */}
              <span style={thStyle}>Organisme</span>
              <span style={thStyle}>Note</span>
              <span style={{ ...thStyle, textAlign: "right" }}>Montant</span>
              <span style={thStyle}>Actions</span>

              {grouped[type].map((p) => (
                editingId === p.id ? (
                  <div key={p.id} style={{ display: "contents" }}>
                    <span style={{ fontSize: 14 }}>{getOrgName(p)}</span>
                    <input
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      style={{ ...inputStyle, padding: "4px 8px", fontSize: 13 }}
                      placeholder="Note"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editMontant}
                      onChange={(e) => setEditMontant(e.target.value)}
                      style={{ ...inputStyle, padding: "4px 8px", fontSize: 13, textAlign: "right", width: 90 }}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(p.id); if (e.key === "Escape") setEditingId(null); }}
                    />
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleUpdate(p.id)} style={iconBtnStyle}><Check size={16} color="var(--app-success)" /></button>
                      <button onClick={() => setEditingId(null)} style={iconBtnStyle}><X size={16} color="var(--app-text-secondary)" /></button>
                    </div>
                  </div>
                ) : (
                  <div key={p.id} style={{ display: "contents" }}>
                    <span style={{ fontSize: 14 }}>{getOrgName(p)}</span>
                    <span style={{ fontSize: 13, color: "var(--app-text-secondary)" }}>{p.note || "—"}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{isPro ? p.montant_ht : p.montant}€</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setEditingId(p.id); setEditMontant(String(isPro ? p.montant_ht : p.montant)); setEditNote(p.note || ""); }} style={iconBtnStyle}>
                        <Pencil size={14} color="var(--app-text-secondary)" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={iconBtnStyle}>
                        <Trash2 size={14} color="var(--app-error)" />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )
      ))}

      {previsions.length === 0 && (
        <div style={cardStyle}>
          <p style={{ color: "var(--app-text-secondary)", textAlign: "center", margin: 0 }}>
            Aucune prevision configuree. Ajoutez des previsions pour automatiser la creation d'entrees budget.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── PROFIL TAB ──────────────────────────────────────────────────────────────

function ProfilTab({ user }: { user: User }) {
  return (
    <div style={cardStyle}>
      <AccountParameters
        user={{
          id: String(user.id),
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          username: user.username ?? "",
          email: user.email,
          role: user.role ?? "",
          image: user.image ?? "",
        }}
        wrapperStyle="simple"
      />
    </div>
  );
}

// ─── ADMIN TAB ───────────────────────────────────────────────────────────────

function AdminTab({ user }: { user: User }) {
  const [reload, setReload] = useState(false);
  const { users } = useGetAllUsers(reload);
  const [action, setAction] = useState<"read" | "create" | "update" | "delete" | "reset" | "none">("read");
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [firstnameToUpdate, setFirstnameToUpdate] = useState("");
  const [lastnameToUpdate, setLastnameToUpdate] = useState("");
  const [usernameToUpdate, setUsernameToUpdate] = useState("");
  const [emailToUpdate, setEmailToUpdate] = useState("");
  const [roleToUpdate, setRoleToUpdate] = useState("");

  const setUserFields = (u: typeof users[0]) => {
    setUserId(String(u.id));
    setFirstnameToUpdate(u.firstName || "");
    setLastnameToUpdate(u.lastName || "");
    setUsernameToUpdate(u.username || "");
    setEmailToUpdate(u.email);
    setRoleToUpdate(u.role || "");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => { setAction("create"); setIsOpen(true); }} style={primaryBtnStyle}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Prenom</th>
              <th style={thStyle}>Pseudo</th>
              <th style={thStyle}>Email</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--app-border)" }}>
                <td style={tdStyle}>{u.lastName}</td>
                <td style={tdStyle}>{u.firstName}</td>
                <td style={tdStyle}>{u.username}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    <button onClick={() => { setAction("update"); setIsOpen(true); setUserFields(u); }} style={iconBtnStyle}>
                      <Pencil size={14} color="var(--app-text-secondary)" />
                    </button>
                    <button onClick={() => { setAction("delete"); setIsOpen(true); setUserId(String(u.id)); setEmailToUpdate(u.email); }} style={iconBtnStyle}>
                      <Trash2 size={14} color="var(--app-error)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserCrud
        userService={backend.user}
        action={action}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        userId={userId}
        firstnameToUpdate={firstnameToUpdate}
        lastnameToUpdate={lastnameToUpdate}
        usernameToUpdate={usernameToUpdate}
        emailToUpdate={emailToUpdate}
        roleToUpdate={roleToUpdate}
        onSuccess={() => setReload(!reload)}
      />
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 0,
  borderBottom: "2px solid var(--app-border)",
};

const tabBtnStyle: React.CSSProperties = {
  padding: "12px 20px",
  background: "none",
  border: "none",
  borderBottom: "2px solid transparent",
  marginBottom: -2,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 12,
  padding: 24,
  border: "1px solid var(--app-border)",
};

const primaryBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  backgroundColor: "var(--app-primary)",
  color: "white",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--app-text-secondary)",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--app-border)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 8,
  transition: "background 0.1s",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
};

const thStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--app-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: "8px 0",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 0",
  fontSize: 14,
};
