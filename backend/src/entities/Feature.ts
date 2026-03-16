// src/entities/Feature.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity("feature")
export class Feature extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  icon!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  category!: string;
}
