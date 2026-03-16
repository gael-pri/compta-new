import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Feature } from "./entities/Feature";
import { Profile } from "./entities/Profile";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "postgres",
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || "argo",
  password: process.env.DATABASE_PASSWORD || "argopass",
  database: process.env.DATABASE_NAME || "argodb",
  synchronize: true,
  logging: false,
  entities: [User, Feature, Profile],
  migrations: [],
  subscribers: []
});
