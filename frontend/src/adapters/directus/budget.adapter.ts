import { directusClient } from "@lib/directusClient";
import { readItems, readItem, createItem, updateItem, deleteItem } from "@directus/sdk";
import { BudgetPort } from "@/core/ports/budget.port";
import { BudgetEntry, BudgetFilters, CreateBudgetInput, UpdateBudgetInput } from "@/core/types/budget";

function mapToBudgetEntry(item: any): BudgetEntry {
  return {
    id: item.id,
    type: item.type,
    organisme: item.organisme_id?.nom ?? item.organisme ?? "",
    organisme_id: item.organisme_id ?? null,
    montant: item.montant,
    mois: item.mois,
    annee: item.annee,
    note: item.note,
    statut: item.statut,
    date_created: item.date_created,
    date_updated: item.date_updated,
  };
}

export const directusBudgetAdapter: BudgetPort = {

  async getAll(filters?: BudgetFilters) {
    const filter: Record<string, any> = {};
    if (filters?.type) filter.type = { _eq: filters.type };
    if (filters?.organisme) filter.organisme = { _eq: filters.organisme };
    if (filters?.mois) filter.mois = { _eq: filters.mois };
    if (filters?.annee) filter.annee = { _eq: filters.annee };
    if (filters?.statut) filter.statut = { _eq: filters.statut };

    const res = await directusClient.request(
      readItems("budget", {
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sort: ["annee", "mois", "type", "organisme"],
        fields: ["*", "organisme_id.id", "organisme_id.nom", "organisme_id.type"],
        limit: -1,
      })
    );
    return res.map(mapToBudgetEntry);
  },

  async getById(id: number) {
    const res = await directusClient.request(readItem("budget", id));
    return res ? mapToBudgetEntry(res) : null;
  },

  async create(entry: CreateBudgetInput) {
    const res = await directusClient.request(createItem("budget", entry));
    return mapToBudgetEntry(res);
  },

  async update(id: number, entry: UpdateBudgetInput) {
    const res = await directusClient.request(updateItem("budget", id, entry));
    return mapToBudgetEntry(res);
  },

  async delete(id: number) {
    await directusClient.request(deleteItem("budget", id));
    return true;
  },
};
