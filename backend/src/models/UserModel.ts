import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import type { CreateUserInput, UpdateUserInput } from "../inputs/UsersInput";

export const UserModel = {
  // Récupérer tous les utilisateurs
  async getAll(): Promise<User[]> {
    return await AppDataSource.manager.find(User, { relations: ["profile"] });
  },

  // Récupérer un utilisateur par ID
  async getById(id: number): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, { where: { id }, relations: ["profile"] });
  },

  // Récupérer un utilisateur par email
  async getByEmail(email: string): Promise<User | null> {
    return await AppDataSource.manager.findOne(User, { where: { email }, relations: ["profile"] });
  },

  // Créer un nouvel utilisateur
  async create(data: CreateUserInput): Promise<User> {
    const user = AppDataSource.manager.create(User, data);
    return await AppDataSource.manager.save(user);
  },

  // Mettre à jour un utilisateur
  async update(
    id: number,
    data: Partial<UpdateUserInput>,
  ): Promise<User | null> {
    await AppDataSource.manager.update(User, id, data);
    return await AppDataSource.manager.findOne(User, { where: { id } });
  },

  // Supprimer un utilisateur
  async delete(id: number): Promise<void> {
    await AppDataSource.manager.delete(User, id);
  },
};
