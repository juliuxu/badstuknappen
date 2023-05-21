import { z } from "zod";
import { timeAndPlaceSchema } from "./time-and-place.server";
import { personInfoSchema } from "./person-info.server";
import { queryBoolean } from "./query-boolean.server";

// Other data
const otherSchema = z.object({
  useMock: queryBoolean,
  debug: queryBoolean,
  password: z.string().min(1),
});
export const getOtherFromUrl = (url: string) =>
  otherSchema.parse(Object.fromEntries(new URL(url).searchParams));

// The requirement for an order
const orderInfoSchema = timeAndPlaceSchema
  .and(personInfoSchema)
  .and(otherSchema);

export type OrderInfo = z.infer<typeof orderInfoSchema>;

export const getOrderInfoFromUrl = (url: string) =>
  orderInfoSchema.parse(Object.fromEntries(new URL(url).searchParams));
