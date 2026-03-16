import { GraphQLError } from "graphql";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Profile } from "../../entities/Profile";
import type { MyContext } from "../../types/context";

@Resolver(Profile)
export class ProfilesQueries {
  @Query(() => Profile, { nullable: true })
  async profile(@Arg("id") id: string): Promise<Profile | null> {
    return Profile.findOne({ where: { id } });
  }

  @Query(() => Profile, { nullable: true })
  async myProfile(@Ctx() context: MyContext): Promise<Profile | null> {
    if (!context.user?.profileId) {
      throw new GraphQLError("Non authentifié", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return Profile.findOne({ where: { id: context.user.profileId } });
  }
}
