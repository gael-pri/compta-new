export type BudgetType = "revenu" | "charges" | "achat" | "aide";

export interface Organisme {
  id: number;
  nom: string;
  type: BudgetType;
}

export interface BudgetEntry {
  id: number;
  type: BudgetType;
  organisme: string;
  organisme_id: Organisme | number | null;
  montant: number;
  mois: number;
  annee: number;
  note?: string | null;
  statut?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
}

export interface BudgetFilters {
  type?: BudgetType;
  organisme?: string;
  mois?: number;
  annee?: number;
  statut?: string;
}

export interface CreateBudgetInput {
  type: BudgetType;
  organisme: string;
  organisme_id: number;
  montant: number;
  mois: number;
  annee: number;
  note?: string | null;
  statut?: string;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {}

export interface BudgetSummary {
  totalRevenus: number;
  totalCharges: number;
  totalAchats: number;
  totalAides: number;
  solde: number;
}
