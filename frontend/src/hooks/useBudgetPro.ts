import { useCallback, useEffect, useState } from "react";
import { backend } from "@/core/backend";
import { BudgetProEntry, BudgetProFilters, BudgetProSummary, CreateBudgetProInput, UpdateBudgetProInput } from "@/core/types/budget-pro";

export function useBudgetPro(filters?: BudgetProFilters) {
  const [entries, setEntries] = useState<BudgetProEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await backend.budgetPro.getAll(filters);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters?.type, filters?.mois, filters?.annee, filters?.statut]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const summary: BudgetProSummary = {
    totalRecettes: entries.filter((e) => e.type === "recette").reduce((s, e) => s + e.montant_ht, 0),
    totalDepenses: entries.filter((e) => e.type === "depense").reduce((s, e) => s + e.montant_ht, 0),
    totalDividendes: entries.filter((e) => e.type === "dividendes").reduce((s, e) => s + e.montant_ht, 0),
    totalImpots: entries.filter((e) => e.type === "impots").reduce((s, e) => s + e.montant_ht, 0),
    totalTvaCollectee: entries.filter((e) => e.type === "recette").reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0),
    totalTvaDeductible: entries.filter((e) => e.type === "depense").reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0),
    get solde() {
      return this.totalRecettes - this.totalDepenses - this.totalDividendes - this.totalImpots;
    },
  };

  const createEntry = async (input: CreateBudgetProInput) => {
    await backend.budgetPro.create(input);
    await fetchEntries();
  };

  const updateEntry = async (id: number, input: UpdateBudgetProInput) => {
    await backend.budgetPro.update(id, input);
    await fetchEntries();
  };

  const deleteEntry = async (id: number) => {
    await backend.budgetPro.delete(id);
    await fetchEntries();
  };

  return { entries, summary, loading, error, createEntry, updateEntry, deleteEntry, refetch: fetchEntries };
}
