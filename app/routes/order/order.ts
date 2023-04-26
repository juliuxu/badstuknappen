import playwright from "playwright";
import { z } from "zod";

const stedToStedId: Record<OrderInfo["sted"], string> = {
  sukkerbiten: "184637%27,184637)",
  langkaia: "189278%27,189278)",
};

interface OrderUrlInfo {
  sted: OrderInfo["sted"];
  date: string; // "05.05.2023"
  time: string; // "07"
}
const buildOrderUrl = ({ sted, date, time }: OrderUrlInfo) => {
  const stedId = stedToStedId[sted];
  return `https://www.planyo.com/booking.php?planyo_lang=NO&mode=reserve&prefill=true&one_date=${date}&start_date=${date}&start_time=${time}&resource_id=${stedId}`;
};

export const orderInfoSchema = z.object({
  sted: z.enum(["sukkerbiten", "langkaia"]),
  date: z.union([
    z.enum([
      "neste-mandag",
      "neste-tirsdag",
      "neste-onsdag",
      "neste-torsdag",
      "neste-fredag",
      "neste-lørdag",
      "neste-søndag",
    ]),
    z.string().regex(/\d{4}-[01]\d-[0-3]\d/),
  ]),
  time: z.string(),

  isMember: z.boolean().default(true),

  fornavn: z.string(),
  etternavn: z.string(),
  epost: z.string(),
  mobil: z.string(),
});
type OrderInfo = z.infer<typeof orderInfoSchema>;
export async function placeOrder(orderInfo: OrderInfo) {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // check selected

  return {
    data: buildOrderUrl({
      sted: "sukkerbiten",
      date: "05.05.2023",
      time: "07",
    }),
    steder: "hello",
  };
}

export async function getSteder(page: playwright.Page) {
  await page.goto("https://oslobadstuforening.no/sok-dropin/");

  const options = await page.locator("#box_prop_res_sted > option").all();
  return (
    await Promise.all(options.map((option) => option.getAttribute("value")))
  ).filter((sted) => sted !== "none");
}
