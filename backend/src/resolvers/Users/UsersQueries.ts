import { GraphQLError } from "graphql";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { User } from "../../entities/User";
import type { MyContext } from "../../types/context";

@Resolver(User)
export class UsersQueries {
  // Récupérer tous les utilisateurs
  @Query(() => [User])
  async getAllUsers(@Ctx() context: MyContext): Promise<User[]> {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    return context.models.User.getAll();
  }

  // Récupérer les informations d'un utilisateur
  @Query(() => User, { nullable: true })
  async getUserById(
    @Arg("id") id: number,
    @Ctx() context: MyContext,
  ): Promise<User | null> {
    if (!context.user) {
      throw new GraphQLError("Unauthorized", {
        extensions: { code: "UNAUTHORIZED" },
      });
    }
    return context.models.User.getById(id);
  }

  // Récupérer l'utilisateur connecté (me)
  @Query(() => User, { nullable: true })
  async me(@Ctx() context: MyContext): Promise<User | null> {
    return context.user ?? null;
  }
}
