import { tokens } from "../tokens";

export const getTokenValue = (name: string) =>
  tokens.find((token) => token.name === name)?.value || name;
