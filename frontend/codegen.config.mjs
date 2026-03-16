// codegen.config.js
import dotenv from "dotenv";
dotenv.config();

const provider = process.env.BACKEND_PROVIDER || "local";

let schema;

switch (provider) {
  case "supabase":
    schema = [
      {
        [`https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/graphql/v1`]: {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        },
      },
    ];
    break;

  case "xano":
    // Xano n’étant pas GraphQL, on désactive le schéma.
    console.warn("⚠️  Xano ne fournit pas de schéma GraphQL. Codegen sera ignoré.");
    schema = null;
    break;

  default:
    schema = process.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:44000/graphql";
}

export default schema
  ? {
      overwrite: true,
      schema,
      documents: "src/graphql/**/*.{ts,tsx,gql,graphql}",
      generates: {
        "src/graphql/__generated__/schema.tsx": {
          plugins: [
            "typescript",
            "typescript-operations",
            "typescript-react-apollo",
          ],
          config: {
            withHooks: true,
            withHOC: false,
            withComponent: false,
          },
        },
      },
    }
  : {};
