import { json } from "@remix-run/node";
import { nesteUkedagToDate } from "~/utils";

export const loader = () => {
  return json({
    locale: new Date().toLocaleTimeString(),
    timezoneOffset: new Date().getTimezoneOffset(),
    nesteOnsdag: nesteUkedagToDate("onsdag"),
    nesteOnsdagRettEtterMidnatt: nesteUkedagToDate(
      "onsdag",
      new Date("2023-04-29T00:01:00.0+0200")
    ),
  });
};
