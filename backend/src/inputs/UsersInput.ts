import { Field, InputType, Int } from "type-graphql";

// Create a user
@InputType()
export class CreateUserInput {
  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

   @Field({ nullable: true })
  username?: string;

  @Field()
  description!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  image!: string;

  @Field()
  birthday!: Date;

  @Field()
  gender!: string;

  @Field(() => Int)
  height!: number;

  @Field()
  created_at!: Date;


  @Field()
  role!: string;
}

// Update a user
@InputType()
export class UpdateUserInput {
  @Field()
  id!: number;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  birthday?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  created_at?: Date;

  @Field()
  role!: string;
}

@InputType()
export class CreateAccountInput {
  @Field()
  email!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  username?: string;

  @Field()
  password!: string;
}
