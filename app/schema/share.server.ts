import { z } from "zod";
import { timeAndPlaceSchema } from "./time-and-place.server";

export const shareSchema = timeAndPlaceSchema.and(
  z.object({
    share: z.literal("true"),
    password: z.string().min(1),
  })
);
export type Share = z.infer<typeof shareSchema>;

export const getShareFromUrl = (url: string) =>
  shareSchema.parse(Object.fromEntries(new URL(url).searchParams));

export const safeParseShareFromUrl = (url: string) => {
  const parsed = shareSchema.safeParse(
    Object.fromEntries(new URL(url).searchParams)
  );
  if (parsed.success) return parsed.data;
  else return undefined;
};
