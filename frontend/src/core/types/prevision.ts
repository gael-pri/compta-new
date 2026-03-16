import { BudgetType, Organisme } from "./budget";

export interface Prevision {
  id: number;
  type: BudgetType;
  organisme_id: Organisme | number | null;
  note?: string | null;
  montant: number;
  date_created?: string | null;
  date_updated?: string | null;
}

export interface CreatePrevisionInput {
  type: BudgetType;
  organisme_id: number;
  note?: string | null;
  montant: number;
}

export interface UpdatePrevisionInput extends Partial<CreatePrevisionInput> {}
