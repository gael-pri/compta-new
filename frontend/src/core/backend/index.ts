// src/core/backend/index.ts
import { API_CONFIG } from "@config/api";

import { UserPort } from "@/core/ports/user.port";
import { AuthPort } from "@/core/ports/auth.port";
import { FeaturePort } from "../ports/feature.port";
import { ComponentPort } from "../ports/component.port";
import { BudgetPort } from "@/core/ports/budget.port";
import { OrganismePort } from "@/core/ports/organisme.port";
import { PrevisionPort } from "@/core/ports/prevision.port";

// adapters
import { graphqlUserAdapter } from "@/adapters/graphql/user.adapter";
import { xanoUserAdapter } from "@/adapters/xano/user.adapter";
import { supabaseUserAdapter } from "@/adapters/supabase/user.adapter";
import { directusUserAdapter } from "@/adapters/directus/user.adapter";

import { graphqlAuthAdapter } from "@/adapters/graphql/auth.adapter";
import { xanoAuthAdapter } from "@/adapters/xano/auth.adapter";
import { supabaseAuthAdapter } from "@/adapters/supabase/auth.adapter";
import { directusAuthAdapter } from "@/adapters/directus/auth.adapter";

import { graphqlFeaturesAdapter } from "@/adapters/graphql/features.adapter";
import { xanoFeaturesAdapter } from "@/adapters/xano/features.adapter";
import { supabaseFeaturesAdapter } from "@/adapters/supabase/features.adapter";
import { directusFeaturesAdapter } from "@/adapters/directus/features.adapter";

// import { graphqlComponentsAdapter } from "@/adapters/graphql/component.adapter";
// import { xanoComponentsAdapter } from "@/adapters/xano/component.adapter";
// import { supabaseComponentsAdapter } from "@/adapters/supabase/component.adapter";
import { directusComponentsAdapter } from "@/adapters/directus/components.adapter";
import { directusBudgetAdapter } from "@/adapters/directus/budget.adapter";
import { directusOrganismeAdapter } from "@/adapters/directus/organisme.adapter";
import { directusPrevisionAdapter } from "@/adapters/directus/prevision.adapter";

const provider = API_CONFIG.provider;

let user: UserPort;
let auth: AuthPort;
let features: FeaturePort;
let components: ComponentPort;
const budget: BudgetPort = directusBudgetAdapter;
const organisme: OrganismePort = directusOrganismeAdapter;
const prevision: PrevisionPort = directusPrevisionAdapter;

switch (provider) {
  case "xano":
    user = xanoUserAdapter;
    auth = xanoAuthAdapter;
    features = xanoFeaturesAdapter;
    components = directusComponentsAdapter;
    break;

  case "supabase":
    user = supabaseUserAdapter;
    auth = supabaseAuthAdapter;
    features = supabaseFeaturesAdapter;
    components = directusComponentsAdapter;
    break;

  case "directus":
    user = directusUserAdapter;
    auth = directusAuthAdapter;
    features = directusFeaturesAdapter;
    components = directusComponentsAdapter;
    break;

  case "graphql":
  default:
    user = graphqlUserAdapter;
    auth = graphqlAuthAdapter;
    features = graphqlFeaturesAdapter;
    components = directusComponentsAdapter;
    break;
}

export const backend = {
  user,
  auth,
  features,
  components,
  budget,
  organisme,
  prevision,
};
