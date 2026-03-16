import type { Request, Response } from "express";
import type { User } from "../entities/User";
import type { UserModel } from "../models/UserModel";
import type { ProfileModel } from "../models/ProfileModel";

export interface MyContext {
  req: Request;
  res: Response;
  user?: User | null;
  models: {
    User: typeof UserModel;
    Profile: typeof ProfileModel;
  };
}
