// src/adapters/xano/features.adapter.ts
import * as xanoApi from "./xano.api";
import { Feature } from "@/core/types/feature";

// Mapper Xano Feature → domaine Feature
function mapXanoFeatureToFeature(f: any): Feature {
  return {
    id: String(f.id),
    title: f.title,
    description: f.description,
    category: f.category,
    icon: f.icon,
    status: f.status
  };
}

export const xanoFeaturesAdapter = {

  ///////////
  // Get ALL
  async getAll(): Promise<Feature[]> {
    const data = await xanoApi.getAllFeatures();
    return data.map(mapXanoFeatureToFeature);
  },
};
