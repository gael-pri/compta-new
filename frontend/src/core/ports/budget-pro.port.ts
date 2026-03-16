import { BudgetProEntry, BudgetProFilters, CreateBudgetProInput, UpdateBudgetProInput } from "@/core/types/budget-pro";

export interface BudgetProPort {
  getAll(filters?: BudgetProFilters): Promise<BudgetProEntry[]>;
  create(entry: CreateBudgetProInput): Promise<BudgetProEntry>;
  update(id: number, entry: UpdateBudgetProInput): Promise<BudgetProEntry>;
  delete(id: number): Promise<boolean>;
}
