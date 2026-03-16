import { Resolver, Query, Arg, Int } from "type-graphql";
import { Feature } from "../../entities/Feature";
import { AppDataSource } from "../../ormconfig";

@Resolver()
export class FeaturesQueries {
  @Query(() => [Feature])
  async features(): Promise<Feature[]> {
    return AppDataSource.manager.find(Feature);
  }

  @Query(() => Feature, { nullable: true })
  async feature(@Arg("id", () => Int) id: number): Promise<Feature | null> {
    return AppDataSource.manager.findOne(Feature, { where: { id } });
  }
}
