import { z } from "zod";
import type { Ukedag } from "~/utils";
import { nesteUkedagToDate } from "~/utils";

const nextUkedagSchema = z.enum([
  "neste-mandag",
  "neste-tirsdag",
  "neste-onsdag",
  "neste-torsdag",
  "neste-fredag",
  "neste-lørdag",
  "neste-søndag",
]);
export const timeAndPlaceSchema = z
  .object({
    sted: z.enum(["sukkerbiten", "langkaia"]),
    time: z.string(),
    date: z.union([nextUkedagSchema, z.string().regex(/\d{4}-[01]\d-[0-3]\d/)]),
  })
  .transform((value) => {
    let absoluteDate = undefined;
    let relativeDate = undefined;
    if (nextUkedagSchema.safeParse(value.date).success) {
      absoluteDate = nesteUkedagToDate(value.date.split("-")[1] as Ukedag);
      relativeDate = value.date;
    } else {
      absoluteDate = value.date;
    }
    return {
      ...value,
      date: absoluteDate,
      relativeDate,
    };
  });

export type TimeAndPlace = z.infer<typeof timeAndPlaceSchema>;

export const safeParseTimeAndPlaceFromUrl = (url: string) => {
  const parsed = timeAndPlaceSchema.safeParse(
    Object.fromEntries(new URL(url).searchParams)
  );
  if (parsed.success) return parsed.data;
  else return undefined;
};
