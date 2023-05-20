import { z } from "zod";
import type { Ukedag } from "~/utils";
import { nesteUkedagToDate } from "~/utils";

const queryBoolean = z.preprocess(
  (value) => (value === "on" ? true : false),
  z.boolean()
);

// Time and place
const timeAndPlaceSchema = z.object({
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

// Share
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

// Person information
const personInfoSchema = z.object({
  isMember: queryBoolean,

  antall: z.coerce.number().min(1).max(4).default(1),

  fornavn: z.string(),
  etternavn: z.string(),
  epost: z.string().email(),
  mobil: z.string(),
});
export type PersonInfo = z.infer<typeof personInfoSchema>;

export const safeParsePersonInfoFromUrl = (url: string) => {
  const parsed = personInfoSchema.safeParse(
    Object.fromEntries(new URL(url).searchParams)
  );
  if (parsed.success) return parsed.data;
  else return undefined;
};

// Metadata
const metaSchema = z.object({
  useMock: queryBoolean,
  debug: queryBoolean,
  password: z.string().min(1),
});

// The requirement for an order
const orderRequestSchema = z
  .object({})
  .merge(timeAndPlaceSchema)
  .merge(personInfoSchema)
  .merge(metaSchema);

export type OrderRequest = Prettify<z.infer<typeof orderRequestSchema>>;
type Prettify<T> = {
  [K in keyof T]: T[K];
};

export const getOrderRequestFromUrl = (url: string) =>
  orderRequestSchema.parse(Object.fromEntries(new URL(url).searchParams));
