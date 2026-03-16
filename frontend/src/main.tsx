import React from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client";

import { API_CONFIG } from "@config/api";
import App from "./App";

import { AuthProvider } from "@context/AuthProvider";
import { AlertProvider } from "@context/AlertContext";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Élément #root introuvable dans index.html");
}

const root = createRoot(container);

/**
 * Apollo est requis uniquement pour GraphQL
 */
const graphqlEndpoint =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ??
  "http://localhost:44000/graphql";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient =
  API_CONFIG.provider === "graphql"
    ? new ApolloClient({
        cache: new InMemoryCache(),
        link: authLink.concat(
          new HttpLink({
            uri: graphqlEndpoint,
            credentials: "include",
          })
        ),
      })
    : null;

/**
 * Providers communs à toute l’app
 */
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AlertProvider>{children}</AlertProvider>
  </AuthProvider>
);

root.render(
  <React.StrictMode>
    {apolloClient ? (
      <ApolloProvider client={apolloClient}>
        <AppProviders>
          <App />
        </AppProviders>
      </ApolloProvider>
    ) : (
      <AppProviders>
        <App />
      </AppProviders>
    )}
  </React.StrictMode>
);
