import { z } from "zod";
import { createCookie } from "@remix-run/node";

import { queryBoolean } from "./query-boolean.server";

export const personInfoSchema = z.object({
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

export const personInfoCookie = createCookie("person-info");

export const serializePersonInfoToCookie = async (personInfo: PersonInfo) => {
  return personInfoCookie.serialize(personInfo, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 400),
  });
};

export const safeParsePersonInfoFromCookie = async (
  cookieHeader: string | null
) => {
  const value = await personInfoCookie.parse(cookieHeader);
  const parsed = personInfoSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  else return undefined;
};
