import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity("profiles")
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  username!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  lastName!: string;

  @Column({ type: "text", nullable: true })
  @Field({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatar_url!: string;

  @Column({ type: "timestamp", nullable: true })
  @Field(() => Date, { nullable: true })
  birthday!: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  gender!: string;

  @Column({ type: "timestamp", nullable: true })
  @Field(() => Date, { nullable: true })
  updated_at!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field(() => Date)
  created_at!: Date;
}
