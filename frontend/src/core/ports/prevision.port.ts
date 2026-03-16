import { Prevision, CreatePrevisionInput, UpdatePrevisionInput } from "@/core/types/prevision";

export interface PrevisionPort {
  getAll(): Promise<Prevision[]>;
  create(input: CreatePrevisionInput): Promise<Prevision>;
  update(id: number, input: UpdatePrevisionInput): Promise<Prevision>;
  delete(id: number): Promise<boolean>;
}
