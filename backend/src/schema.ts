import { ApolloServer } from "apollo-server";
import { UsersMutations } from "./resolvers/Users/UsersMutations";
import { UsersQueries } from "./resolvers/Users/UsersQueries";
import { buildSchema } from "type-graphql";
import { User } from "./entities/User";

const typeDefs = `
  type User {
    id: Int!
    name: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(name: String!): User!
    login(email: String!, password: String!): User!
  }
`;

export const startServer = async () => {
  const schema = await buildSchema({
    resolvers: [UsersMutations, UsersQueries],
  });

  return new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      models: {
        User,
      },
    }),
  });
};
