export type BudgetProType = "depense" | "recette" | "dividendes" | "impots";

export interface OrganismePro {
  id: number;
  nom: string;
  type: BudgetProType;
}

export interface BudgetProEntry {
  id: number;
  type: BudgetProType;
  organisme: string;
  organisme_id: OrganismePro | number | null;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  jour?: number | null;
  mois: number;
  annee: number;
  note?: string | null;
  statut?: string | null;
  argent_avance?: number | null;
  piece_jointe?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
}

export interface BudgetProFilters {
  type?: BudgetProType;
  mois?: number;
  annee?: number;
  statut?: string;
}

export interface CreateBudgetProInput {
  type: BudgetProType;
  organisme_id: number;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  jour?: number | null;
  mois: number;
  annee: number;
  note?: string | null;
  statut?: string;
  argent_avance?: number | null;
  piece_jointe?: string | null;
}

export interface UpdateBudgetProInput extends Partial<CreateBudgetProInput> {}

export interface BudgetProSummary {
  totalRecettes: number;
  totalDepenses: number;
  totalDividendes: number;
  totalImpots: number;
  totalTvaCollectee: number;
  totalTvaDeductible: number;
  solde: number;
}

export interface PrevisionPro {
  id: number;
  type: BudgetProType;
  organisme_id: OrganismePro | number | null;
  note?: string | null;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  date_created?: string | null;
  date_updated?: string | null;
}

export interface CreatePrevisionProInput {
  type: BudgetProType;
  organisme_id: number;
  note?: string | null;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
}

export interface UpdatePrevisionProInput extends Partial<CreatePrevisionProInput> {}
