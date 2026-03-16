import { UsersMutations } from "./Users/UsersMutations";
import { UsersQueries } from "./Users/UsersQueries";
import { ProfilesQueries } from "./Profiles/ProfilesQueries";
import { ProfilesMutations } from "./Profiles/ProfilesMutations";
import { FeaturesQueries } from "./Features/FeaturesQueries";
import { FeaturesMutations } from "./Features/FeaturesMutations";

export const resolvers = [
  UsersMutations,
  UsersQueries,
  ProfilesQueries,
  ProfilesMutations,
  FeaturesQueries,
  FeaturesMutations,
] as const;
