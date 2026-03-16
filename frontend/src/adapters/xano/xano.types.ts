// src/adapters/xano/xano.types.ts
export interface XanoUserDTO {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  avatar?: string;
  image?: string;
}

export interface XanoAuthResponse {
  authToken?: string;
  user?: XanoUserDTO;
}

export type XanoMeResponse = XanoUserDTO | null;