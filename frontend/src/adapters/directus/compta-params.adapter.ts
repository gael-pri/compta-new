import { directusClient } from "@lib/directusClient";
import { readItems, updateItem } from "@directus/sdk";
import { ComptaParamsPort, ComptaParam } from "@/core/ports/compta-params.port";

function mapParam(item: any): ComptaParam {
  return {
    id: item.id,
    key: item.key,
    label: item.label ?? "",
    value: item.value ?? 0,
  };
}

export const directusComptaParamsAdapter: ComptaParamsPort = {
  async get(key: string) {
    const res = await directusClient.request(
      readItems("compta_parameters", {
        filter: { key: { _eq: key } },
        limit: 1,
      })
    );
    return res.length > 0 ? mapParam(res[0]) : null;
  },

  async updateValue(key: string, value: number) {
    const existing = await this.get(key);
    if (!existing) throw new Error(`Param "${key}" not found`);
    const res = await directusClient.request(
      updateItem("compta_parameters", existing.id, { value })
    );
    return mapParam(res);
  },
};
