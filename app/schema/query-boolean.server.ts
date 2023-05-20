import { z } from "zod";

export const queryBoolean = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean()
);
