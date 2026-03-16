import { directusClient } from "@lib/directusClient";
import { readItems, createItem, updateItem, deleteItem } from "@directus/sdk";
import { PrevisionProPort } from "@/core/ports/prevision-pro.port";
import { PrevisionPro, CreatePrevisionProInput, UpdatePrevisionProInput } from "@/core/types/budget-pro";

function mapEntry(item: any): PrevisionPro {
  return {
    id: item.id,
    type: item.type,
    organisme_id: item.organisme_id ?? null,
    note: item.note,
    montant_ht: item.montant_ht,
    tva: item.tva ?? 20,
    montant_ttc: item.montant_ttc ?? item.montant_ht * (1 + (item.tva ?? 20) / 100),
    date_created: item.date_created,
    date_updated: item.date_updated,
  };
}

export const directusPrevisionProAdapter: PrevisionProPort = {
  async getAll() {
    const res = await directusClient.request(
      readItems("prevision_pro", {
        sort: ["type", "organisme_id"],
        fields: ["*", "organisme_id.id", "organisme_id.nom", "organisme_id.type"],
        limit: -1,
      })
    );
    return res.map(mapEntry);
  },

  async create(input: CreatePrevisionProInput) {
    const res = await directusClient.request(createItem("prevision_pro", input));
    return mapEntry(res);
  },

  async update(id: number, input: UpdatePrevisionProInput) {
    const res = await directusClient.request(updateItem("prevision_pro", id, input));
    return mapEntry(res);
  },

  async delete(id: number) {
    await directusClient.request(deleteItem("prevision_pro", id));
    return true;
  },
};
