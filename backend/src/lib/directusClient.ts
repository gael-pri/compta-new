// src/lib/directusClient.ts
import { createDirectus, rest, staticToken } from "@directus/sdk";
import dotenv from "dotenv";

dotenv.config();

// URL de ton projet Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL!; 

// Client principal côté serveur (admin)
export const directusAdminClient = createDirectus(process.env.DIRECTUS_URL!)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!))
  .with(rest());

// Client côté frontend (optionnel, pour appels non-admin)
export const directusClient = createDirectus(DIRECTUS_URL).with(rest());
