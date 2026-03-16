// src/core/ports/feature.port.ts
import { Component } from "@/core/types/component";

export interface ComponentPort {
  getAll(): Promise<Component[]>;
  getById?(id: string | number): Promise<Component | null>;
}
