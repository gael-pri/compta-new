import { BudgetEntry, BudgetFilters, CreateBudgetInput, UpdateBudgetInput } from "@/core/types/budget";

export interface BudgetPort {
  getAll(filters?: BudgetFilters): Promise<BudgetEntry[]>;
  getById(id: number): Promise<BudgetEntry | null>;
  create(entry: CreateBudgetInput): Promise<BudgetEntry>;
  update(id: number, entry: UpdateBudgetInput): Promise<BudgetEntry>;
  delete(id: number): Promise<boolean>;
}
