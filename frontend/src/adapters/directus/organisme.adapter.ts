import { directusClient } from "@lib/directusClient";
import { readItems, createItem, updateItem, deleteItem } from "@directus/sdk";
import { OrganismePort } from "@/core/ports/organisme.port";
import { Organisme, BudgetType } from "@/core/types/budget";

function mapToOrganisme(item: any): Organisme {
  return {
    id: item.id,
    nom: item.nom,
    type: item.type,
  };
}

export const directusOrganismeAdapter: OrganismePort = {

  async getAll() {
    const res = await directusClient.request(
      readItems("organisme", { sort: ["type", "nom"], limit: -1 })
    );
    return res.map(mapToOrganisme);
  },

  async create(nom: string, type: BudgetType) {
    const res = await directusClient.request(createItem("organisme", { nom, type }));
    return mapToOrganisme(res);
  },

  async update(id: number, data: Partial<{ nom: string; type: BudgetType }>) {
    const res = await directusClient.request(updateItem("organisme", id, data));
    return mapToOrganisme(res);
  },

  async delete(id: number) {
    await directusClient.request(deleteItem("organisme", id));
    return true;
  },
};
