// src/seed/featureSeed.ts
import { AppDataSource } from "../ormconfig";
import { Feature } from "../entities/Feature";

export const featureSeed = async () => {
  const featuresData = [
    // Category: home
    { icon: "Zap", title: "Backend", description: "Node, Express, TypeOrm, Apollo Serveur et GraphQL.", category: "home" },
    { icon: "Server", title: "Frontend", description: "Vite, Apollo Client, GraphQl.", category: "home" },
    { icon: "RouteIcon", title: "Devops", description: "Les workflow connectés à Github et au VPS font le boulot avec Docker.", category: "home" },
    { icon: "Shield", title: "API routes", description: "Choix possible entre Postgres et Adminer. Ou directement connecter à des API comme Supabase et Xano.", category: "home" },
    { icon: "Waves", title: "Libellule", description: "Bientôt une cinquantaine de composants disponibles.", category: "home" },
    { icon: "Sparkles", title: "Services", description: "Connectez-vous aux services de Google Map, Mapbox, Stripe et plus.", category: "home" },

    // Category: dashboard
    { icon: "Zap", title: "Authentification", description: "Account Parameters, Button Google, Forgot Password, Login, Profile Badge, Reset Password, Sign Up, Supabase CRUD, User Invite", category: "dashboard" },
    { icon: "Server", title: "Formulaires", description: "Action Button, Checkbox, Dropdown, Input Combo Select, Phone Selector", category: "dashboard" },
    { icon: "RouteIcon", title: "Géolocalisation", description: "Button Walk, Job Card, Job Offers Card, Leaflet Distance Chip, Leaflet Map, MapBox", category: "dashboard" },
    { icon: "Shield", title: "Graphiques", description: "Bar Chart Multiple, Graph Js, Radial Chart", category: "dashboard" },
    { icon: "Waves", title: "Interactions", description: "Page Loader, Qr Code, Smart Loader", category: "dashboard" },
    { icon: "Sparkles", title: "Shopping", description: "Stripe Checkout Button, Stripe Subscription Button", category: "dashboard" },
    { icon: "Sparkles", title: "Interface utilisateur", description: "Alert Manager, Calendar Heroui, Calendar ShadCn, Datagrid, File Uploader, Hero Card, Hours Calculator, Jam Badge, Kanban, Toast", category: "dashboard" },
  ];

  for (const f of featuresData) {
    // On vérifie si la feature existe déjà pour éviter les doublons
    const exists = await AppDataSource.manager.findOne(Feature, { where: { title: f.title, category: f.category } });
    if (!exists) {
      // Crée et sauvegarde directement
      const feature = AppDataSource.manager.create(Feature, f);
      await AppDataSource.manager.save(feature);
      console.log(`Feature created: ${f.title} (${f.category})`);
    }
  }

  console.log("✅ Feature seed complete");
};
