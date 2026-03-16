import { GraphQLError } from "graphql";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Profile } from "../../entities/Profile";
import { UpdateProfileInput } from "../../inputs/ProfileInput";
import type { MyContext } from "../../types/context";

@Resolver(Profile)
export class ProfilesMutations {
  @Mutation(() => Profile)
  async updateProfile(
    @Arg("data") data: UpdateProfileInput,
    @Ctx() context: MyContext,
  ): Promise<Profile> {
    if (!context.user?.profileId) {
      throw new GraphQLError("Non authentifié", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const profile = await context.models.Profile.update(context.user.profileId, data);
    if (!profile) {
      throw new GraphQLError("Profil introuvable", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return profile;
  }
}
