// src/adapters/directus/features.adapter.ts
import { directusClient } from "@lib/directusClient";
import { Feature } from "@/core/types/feature";
import { readItems } from "@directus/sdk";

// Mapper Directus Feature → domaine Feature
function mapDirectusFeatureToFeature(f: any): Feature {
  return {
    id: String(f.id),
    title: f.title,
    description: f.description,
    category: f.category,
    icon: f.icon,
    status: f.status
  };
}

export const directusFeaturesAdapter = {

  ///////////
  // Get ALL
  async getAll() {
    const res = await directusClient.request(
      readItems("features")
    );
    return res.map(mapDirectusFeatureToFeature);
  },
};
