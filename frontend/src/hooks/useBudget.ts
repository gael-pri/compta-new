import { useCallback, useEffect, useState } from "react";
import { backend } from "@/core/backend";
import { BudgetEntry, BudgetFilters, BudgetSummary, CreateBudgetInput, UpdateBudgetInput } from "@/core/types/budget";

export function useBudget(filters?: BudgetFilters) {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await backend.budget.getAll(filters);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.organisme, filters?.mois, filters?.annee, filters?.statut]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const summary: BudgetSummary = {
    totalRevenus: entries.filter((e) => e.type === "revenu").reduce((s, e) => s + e.montant, 0),
    totalCharges: entries.filter((e) => e.type === "charges").reduce((s, e) => s + e.montant, 0),
    totalAchats: entries.filter((e) => e.type === "achat").reduce((s, e) => s + e.montant, 0),
    totalAides: entries.filter((e) => e.type === "aide").reduce((s, e) => s + e.montant, 0),
    get solde() {
      return this.totalRevenus + this.totalAides - this.totalCharges - this.totalAchats;
    },
  };

  const createEntry = async (input: CreateBudgetInput) => {
    const created = await backend.budget.create(input);
    await fetchEntries();
    return created;
  };

  const updateEntry = async (id: number, input: UpdateBudgetInput) => {
    const updated = await backend.budget.update(id, input);
    await fetchEntries();
    return updated;
  };

  const deleteEntry = async (id: number) => {
    await backend.budget.delete(id);
    await fetchEntries();
  };

  return { entries, summary, loading, error, createEntry, updateEntry, deleteEntry, refetch: fetchEntries };
}
