import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";

export class UserService {
  private repo = AppDataSource.getRepository(User);

  async getAll() {
    return this.repo.find();
  }

  async create() {
    const user = this.repo.create();
    return this.repo.save(user);
  }

  async getById(id: number) {
    return this.repo.findOneBy({ id });
  }
}
