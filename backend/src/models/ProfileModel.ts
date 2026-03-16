import { AppDataSource } from "../ormconfig";
import { Profile } from "../entities/Profile";

export const ProfileModel = {
  async getById(id: string): Promise<Profile | null> {
    return AppDataSource.manager.findOne(Profile, { where: { id } });
  },

  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    await AppDataSource.manager.update(Profile, id, { ...data, updated_at: new Date() });
    return AppDataSource.manager.findOne(Profile, { where: { id } });
  },

  async create(data: Partial<Profile>): Promise<Profile> {
    const profile = AppDataSource.manager.create(Profile, data);
    return AppDataSource.manager.save(profile);
  },
};
