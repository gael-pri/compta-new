// src/tokens/index.ts
import { colors } from "./tokens-colors";
import { color_basics } from "./tokens-basics";
import { typography } from "./tokens-typography";
import { spacing } from "./tokens-spacing";

export const tokens = [...colors, ...color_basics, ...typography, ...spacing];
