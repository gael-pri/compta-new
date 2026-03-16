import { lazy } from "react";
import type { ComponentType } from "react";
import type { LeafletMapProps } from "./LeafletMap";

const LeafletMap = lazy(
  () => import("./LeafletMap").then(mod => ({ default: mod.default }))
) as ComponentType<LeafletMapProps>;

export default LeafletMap;
