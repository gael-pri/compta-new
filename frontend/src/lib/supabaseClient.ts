// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient: SupabaseClient = url && key
  ? createClient(url, key)
  : (null as unknown as SupabaseClient);
