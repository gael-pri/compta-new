import { directusClient } from "@lib/directusClient";
import { readItems, createItem, updateItem, deleteItem } from "@directus/sdk";
import { OrganismeProPort } from "@/core/ports/organisme-pro.port";
import { OrganismePro, BudgetProType } from "@/core/types/budget-pro";

function mapToOrganisme(item: any): OrganismePro {
  return { id: item.id, nom: item.nom, type: item.type };
}

export const directusOrganismeProAdapter: OrganismeProPort = {
  async getAll() {
    const res = await directusClient.request(
      readItems("organisme_pro", { sort: ["type", "nom"], limit: -1 })
    );
    return res.map(mapToOrganisme);
  },

  async create(nom: string, type: BudgetProType) {
    const res = await directusClient.request(createItem("organisme_pro", { nom, type }));
    return mapToOrganisme(res);
  },

  async update(id: number, data: Partial<{ nom: string; type: BudgetProType }>) {
    const res = await directusClient.request(updateItem("organisme_pro", id, data));
    return mapToOrganisme(res);
  },

  async delete(id: number) {
    await directusClient.request(deleteItem("organisme_pro", id));
    return true;
  },
};
