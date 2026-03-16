// src/entities/User.ts
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Profile } from "./Profile";

@ObjectType()
@Entity("user")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number;

  @Column({ type: "uuid", nullable: true })
  profileId!: string;

  @OneToOne(() => Profile)
  @JoinColumn({ name: "profileId" })
  @Field(() => Profile, { nullable: true })
  profile!: Profile;

  @Column({ length: 20 })
  @Field()
  firstName!: string;

  @Column({ length: 20 })
  @Field()
  lastName!: string;

  @Column({ length: 20, nullable: true })
  @Field({ nullable: true })
  username!: string;

  @Column("text")
  @Field()
  description!: string;

  @Column({ length: 50 })
  @Field()
  email!: string;

  @Column({ length: 250 })
  password!: string;

  @Column({ length: 250, nullable: true })
  @Field({ nullable: true })
  image!: string;

  @Column({ nullable: true, type: "timestamp" })
  @Field(() => Date, { nullable: true })
  birthday!: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  gender!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @Field(() => Date)
  created_at!: Date;

  @Column("text")
  @Field()
  role!: string;

  @Column({ type: "varchar", length: 250, nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpiry!: Date | null;

  @Column({ type: "boolean", default: false })
  @Field()
  emailVerified!: boolean;

  @Column({ type: "varchar", length: 250, nullable: true })
  emailVerifyToken!: string | null;
}
