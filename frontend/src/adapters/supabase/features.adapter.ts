// src/adapters/supabase/features.adapter.ts
import { supabaseClient } from "@lib/supabaseClient";
import { Feature } from "@/core/types/feature";

// Mapper Supabase Feature → domaine Feature
function mapProfileToFeature(f: any): Feature {
  return {
    id: String(f.id),
    title: f.title,
    description: f.description,
    category: f.category,
    icon: f.icon,
    status: f.status
  };
}

export const supabaseFeaturesAdapter = {

  ///////////
  // Get ALL
  async getAll(): Promise<Feature[]> {
    const { data, error } = await supabaseClient
      .from("features")
      .select("*");
    if (error) throw error;
    return (data ?? []).map(mapProfileToFeature);
  },
};
