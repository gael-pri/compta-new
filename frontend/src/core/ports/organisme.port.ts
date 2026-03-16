import { Organisme, BudgetType } from "@/core/types/budget";

export interface OrganismePort {
  getAll(): Promise<Organisme[]>;
  create(nom: string, type: BudgetType): Promise<Organisme>;
  update(id: number, data: Partial<{ nom: string; type: BudgetType }>): Promise<Organisme>;
  delete(id: number): Promise<boolean>;
}
