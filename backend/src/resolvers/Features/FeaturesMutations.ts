import { Resolver, Mutation, Arg, Int } from "type-graphql";
import { Feature } from "../../entities/Feature";
import { AppDataSource } from "../../ormconfig";

@Resolver()
export class FeaturesMutations {
  @Mutation(() => Feature)
  async createFeature(
    @Arg("icon") icon: string,
    @Arg("title") title: string,
    @Arg("description") description: string,
    @Arg("category") category: string
  ): Promise<Feature> {
    const feature = AppDataSource.manager.create(Feature, { icon, title, description, category });
    return AppDataSource.manager.save(feature);
  }

  @Mutation(() => Feature, { nullable: true })
  async updateFeature(
    @Arg("id", () => Int) id: number,
    @Arg("icon", { nullable: true }) icon?: string,
    @Arg("title", { nullable: true }) title?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("category", { nullable: true }) category?: string
  ): Promise<Feature | null> {
    const feature = await AppDataSource.manager.findOne(Feature, { where: { id } });
    if (!feature) return null;

    if (icon !== undefined) feature.icon = icon;
    if (title !== undefined) feature.title = title;
    if (description !== undefined) feature.description = description;
    if (category !== undefined) feature.category = category;

    return AppDataSource.manager.save(feature);
  }

  @Mutation(() => Boolean)
  async deleteFeature(@Arg("id", () => Int) id: number): Promise<boolean> {
    const result = await AppDataSource.manager.delete(Feature, id);
    return result.affected !== 0;
  }
}
