// src/adapters/directus/components.adapter.ts
import { directusClient } from "@lib/directusClient";
import { Component } from "@/core/types/component";
import { readItems } from "@directus/sdk";

// Mapper Directus Component → domaine Component
function mapDirectusComponentToComponent(f: any): Component {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    detail: f.detail,
    category: f.category,
  };
}

export const directusComponentsAdapter = {

  ///////////
  // Get ALL
  async getAll() {
    const res = await directusClient.request(
      readItems("components")
    );
    return res.map(mapDirectusComponentToComponent);
  },
};
