import { z } from "zod";
import { timeAndPlaceSchema } from "./time-and-place.server";

export const shareSchema = timeAndPlaceSchema.extend({
  share: z.literal("true"),
  password: z.string().min(1),
});
export type Share = z.infer<typeof shareSchema>;

export const safeParseShareFromUrl = (url: string) => {
  const parsed = shareSchema.safeParse(
    Object.fromEntries(new URL(url).searchParams)
  );
  if (parsed.success) return parsed.data;
  else return undefined;
};
