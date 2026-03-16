// src/adapters/graphql/features.adapter.ts
import { apolloClient } from "@lib/apolloClient";
import { GET_ALL_FEATURES } from "@graphql/queries/feature";
import { Feature } from "@/core/types/feature";

// Mapper GraphQL Feature → domaine Feature
function mapGraphqlFeatureToFeature(f: any): Feature {
  return {
    id: String(f.id),
    title: f.title,
    description: f.description,
    category: f.category,
    icon: f.icon,
    status: f.status
  };
}

export const graphqlFeaturesAdapter = {

  ///////////
  // Get ALL
  async getAll(): Promise<Feature[]> {
    const { data } = await apolloClient.query({ query: GET_ALL_FEATURES });
    return (data?.features ?? []).map(mapGraphqlFeatureToFeature);
  },
};
