import { InputType, Field } from "type-graphql";

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true }) username?: string;
  @Field({ nullable: true }) firstName?: string;
  @Field({ nullable: true }) lastName?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) avatar_url?: string;
  @Field({ nullable: true }) gender?: string;
  @Field(() => Date, { nullable: true }) birthday?: Date;
}
