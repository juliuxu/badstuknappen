import { z } from "zod";
import type { Ukedag } from "~/utils";
import { nesteUkedagToDate } from "~/utils";

const queryBoolean = z.preprocess(
  (value) => (value === "on" ? true : false),
  z.boolean()
);
const orderInfoSchema = z.object({
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
  antall: z.coerce.number().min(1).max(4).default(1),

  isMember: queryBoolean,

  fornavn: z.string(),
  etternavn: z.string(),
  epost: z.string(),
  mobil: z.string(),

  useMock: queryBoolean,
  debug: queryBoolean,
  password: z.string().nonempty(),
});
export type OrderInfo = z.infer<typeof orderInfoSchema>;

export const getOrderInfo = (fromUrl: string) =>
  orderInfoSchema.parse(Object.fromEntries(new URL(fromUrl).searchParams));
