import { PrevisionPro, CreatePrevisionProInput, UpdatePrevisionProInput } from "@/core/types/budget-pro";

export interface PrevisionProPort {
  getAll(): Promise<PrevisionPro[]>;
  create(input: CreatePrevisionProInput): Promise<PrevisionPro>;
  update(id: number, input: UpdatePrevisionProInput): Promise<PrevisionPro>;
  delete(id: number): Promise<boolean>;
}
