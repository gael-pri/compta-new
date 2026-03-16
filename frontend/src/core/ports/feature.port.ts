// src/core/ports/feature.port.ts
import { Feature } from "@/core/types/feature";

export interface FeaturePort {
  getAll(): Promise<Feature[]>;
  getById?(id: string | number): Promise<Feature | null>;
}
