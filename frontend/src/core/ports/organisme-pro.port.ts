import { OrganismePro, BudgetProType } from "@/core/types/budget-pro";

export interface OrganismeProPort {
  getAll(): Promise<OrganismePro[]>;
  create(nom: string, type: BudgetProType): Promise<OrganismePro>;
  update(id: number, data: Partial<{ nom: string; type: BudgetProType }>): Promise<OrganismePro>;
  delete(id: number): Promise<boolean>;
}
