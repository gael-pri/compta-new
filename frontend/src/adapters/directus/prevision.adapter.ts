import { directusClient } from "@lib/directusClient";
import { readItems, createItem, updateItem, deleteItem } from "@directus/sdk";
import { PrevisionPort } from "@/core/ports/prevision.port";
import { Prevision, CreatePrevisionInput, UpdatePrevisionInput } from "@/core/types/prevision";

function mapToPrevision(item: any): Prevision {
  return {
    id: item.id,
    type: item.type,
    organisme_id: item.organisme_id ?? null,
    note: item.note,
    montant: item.montant,
    date_created: item.date_created,
    date_updated: item.date_updated,
  };
}

export const directusPrevisionAdapter: PrevisionPort = {
  async getAll() {
    const res = await directusClient.request(
      readItems("prevision", {
        sort: ["type", "organisme_id"],
        fields: ["*", "organisme_id.id", "organisme_id.nom", "organisme_id.type"],
        limit: -1,
      })
    );
    return res.map(mapToPrevision);
  },

  async create(input: CreatePrevisionInput) {
    const res = await directusClient.request(createItem("prevision", input));
    return mapToPrevision(res);
  },

  async update(id: number, input: UpdatePrevisionInput) {
    const res = await directusClient.request(updateItem("prevision", id, input));
    return mapToPrevision(res);
  },

  async delete(id: number) {
    await directusClient.request(deleteItem("prevision", id));
    return true;
  },
};
