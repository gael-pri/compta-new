// src/index.ts
import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { resolvers } from "./resolvers";
import { AppDataSource } from "./ormconfig";
import { getUser } from "./utils/getUser";
import { MyContext } from "./types/context";
import { GraphQLError } from "graphql";
import path from "path";
import { UserModel } from "./models/UserModel";
import { ProfileModel } from "./models/ProfileModel";

import { authRoutes } from "./routes/auth.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { healthRoutes } from "./routes/health.routes";
import { directusRoutes } from "./routes/directus.routes";
import { emailRoutes } from "./routes/email.routes";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({ origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            "https://api.argostack.argoweb.fr"
        ];
        if (!origin || allowedOrigins.includes(origin)) { return callback(null, true); }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Logging middleware
app.use((req, res, next) => {
  console.log("Incoming Request:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });
  next();
});

const startServer = async () => {
    await AppDataSource.initialize();

    const schema = await buildSchema({ resolvers });

    const server = new ApolloServer({
        schema,
        introspection: true,
        csrfPrevention: false,
        formatError: (error: GraphQLError) => {
            console.error(error);
            return {
            message: error.message,
            code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            };
        },
    });

    await server.start();

    app.use("/auth", authRoutes);
    app.use("/uploads", uploadRoutes);
    app.use("/health", healthRoutes);
    app.use("/email", emailRoutes);
    app.use('/images/profiles', express.static(path.join(__dirname, '..', 'public', 'images', 'profiles')));
    app.use("/api/directus", directusRoutes);

    // Middleware Apollo
    app.use( "/",  expressMiddleware(server, {
        context: async ({ req, res }: { req: Request; res: Response }): Promise<MyContext> => {
            const user = await getUser(req);
            return { req, res, user, models: { User: UserModel, Profile: ProfileModel } };
        },
        }),
    );

    app.listen(process.env.PORT || 44000, () =>
        console.log(`🚀 Server running on ${process.env.SERVER_URL}:${process.env.PORT}`)
    );
};

startServer().catch(console.error);
