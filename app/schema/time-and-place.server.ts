import { z } from "zod";
import type { Ukedag } from "~/utils";
import { nesteUkedagToDate } from "~/utils";

export const timeAndPlaceSchema = z.object({
  sted: z.enum(["sukkerbiten", "langkaia"]),
  date: z.union([
    z
      .enum([
        "neste-mandag",
        "neste-tirsdag",
        "neste-onsdag",
        "neste-torsdag",
        "neste-fredag",
        "neste-lørdag",
        "neste-søndag",
      ])
      .transform((value) => {
        return nesteUkedagToDate(value.split("-")[1] as Ukedag);
      }),
    z.string().regex(/\d{4}-[01]\d-[0-3]\d/),
  ]),
  time: z.string(),
});
export type TimeAndPlace = z.infer<typeof timeAndPlaceSchema>;

export const safeParseTimeAndPlaceFromUrl = (url: string) => {
  const parsed = timeAndPlaceSchema.safeParse(
    Object.fromEntries(new URL(url).searchParams)
  );
  if (parsed.success) return parsed.data;
  else return undefined;
};
