import { Request } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { AppDataSource } from "../ormconfig";

export const getUser = async (req: Request): Promise<User | null> => {
  const token = req.cookies?.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const user = await AppDataSource.manager.findOne(User, { where: { email: decoded.email }, relations: ["profile"] });
    return user;
  } catch {
    return null;
  }
};
