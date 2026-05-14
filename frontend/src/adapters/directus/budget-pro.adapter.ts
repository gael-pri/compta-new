import { directusClient } from "@lib/directusClient";
import { readItems, createItem, updateItem, deleteItem } from "@directus/sdk";
import { BudgetProPort } from "@/core/ports/budget-pro.port";
import { BudgetProEntry, BudgetProFilters, CreateBudgetProInput, UpdateBudgetProInput } from "@/core/types/budget-pro";

function mapEntry(item: any): BudgetProEntry {
  return {
    id: item.id,
    type: item.type,
    organisme: item.organisme_id?.nom ?? "",
    organisme_id: item.organisme_id ?? null,
    montant_ht: item.montant_ht,
    tva: item.tva ?? 20,
    montant_ttc: item.montant_ttc ?? item.montant_ht * (1 + (item.tva ?? 20) / 100),
    jour: item.jour ?? null,
    mois: item.mois,
    annee: item.annee,
    note: item.note,
    statut: item.statut,
    argent_avance: item.argent_avance ?? 0,
    piece_jointe: typeof item.piece_jointe === "object" ? item.piece_jointe?.id ?? null : item.piece_jointe ?? null,
    date_created: item.date_created,
    date_updated: item.date_updated,
  };
}

export const directusBudgetProAdapter: BudgetProPort = {
  async getAll(filters?: BudgetProFilters) {
    const filter: Record<string, any> = {};
    if (filters?.type) filter.type = { _eq: filters.type };
    if (filters?.mois) filter.mois = { _eq: filters.mois };
    if (filters?.annee) filter.annee = { _eq: filters.annee };
    if (filters?.statut) filter.statut = { _eq: filters.statut };

    const res = await directusClient.request(
      readItems("budget_pro", {
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sort: ["annee", "mois", "type"],
        fields: ["*", "organisme_id.id", "organisme_id.nom", "organisme_id.type", "piece_jointe"],
        limit: -1,
      })
    );
    return res.map(mapEntry);
  },

  async create(entry: CreateBudgetProInput) {
    const res = await directusClient.request(createItem("budget_pro", entry));
    return mapEntry(res);
  },

  async update(id: number, entry: UpdateBudgetProInput) {
    const res = await directusClient.request(updateItem("budget_pro", id, entry));
    return mapEntry(res);
  },

  async delete(id: number) {
    await directusClient.request(deleteItem("budget_pro", id));
    return true;
  },
};
