import playwright from "playwright";
import { z } from "zod";
import type { Ukedag } from "~/utils";
import { ukedagToDate } from "~/utils";

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
        return ukedagToDate(value.split("-")[0] as Ukedag);
      }),
    z.string().regex(/\d{4}-[01]\d-[0-3]\d/),
  ]),
  time: z.string(),
  antall: z.coerce.number().min(1).max(4).default(1),

  isMember: z.preprocess(
    (value) => (value === "on" ? true : undefined),
    z.boolean().default(false)
  ),

  fornavn: z.string(),
  etternavn: z.string(),
  epost: z.string(),
  mobil: z.string(),

  debug: z.preprocess(
    (value) => (value === "on" ? true : undefined),
    z.boolean().default(false)
  ),
  password: z.string().nonempty(),
});
type OrderInfo = z.infer<typeof orderInfoSchema>;

export const getOrderInfo = (fromUrl: string) =>
  orderInfoSchema.parse(Object.fromEntries(new URL(fromUrl).searchParams));

export async function placeOrder(
  orderInfo: OrderInfo,
  log: (obj: { event?: string; data: string }) => void
) {
  if (orderInfo.password !== process.env.PASSWORD) {
    log({ data: `❌ WRONG PASSWORD ❌` });
    return;
  }

  log({
    data: `🤖 Ordering with info: ${JSON.stringify(orderInfo, null, 2)}`,
  });

  // Start playwright
  const browser = await playwright.chromium.launch({
    headless: !orderInfo.debug,
    slowMo: orderInfo.debug ? 400 : 200,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Cleanup function
  async function cleanup() {
    if (!orderInfo.debug) {
      await page.close();
    }
  }

  // Url
  const orderUrl = buildOrderUrl(orderInfo);
  log({ data: `🧭 navigating to ${orderUrl}` });
  page.goto(orderUrl);

  // Assert start time is free
  const startTimeValue = await page.locator("#start_time").inputValue();
  if (Number(startTimeValue) !== Number(orderInfo.time)) {
    log({
      data: `❌ chosen time ${orderInfo.time} does not match selected start time ${startTimeValue}`,
    });
    return await cleanup();
  }

  // Antall
  const memberSelect = page
    .locator("#rental_prop_Antall_personer .form-group")
    .filter({ hasText: "Medlem" })
    .locator("select")
    .first();
  const nonMemberSelect = page
    .locator("#rental_prop_Antall_personer .form-group")
    .filter({ hasText: "ikke-medlemmer" })
    .locator("select")
    .first();
  const antallSelect = orderInfo.isMember ? memberSelect : nonMemberSelect;

  log({ data: `🖊 setting antall to ${orderInfo.antall}` });
  await antallSelect.selectOption(String(orderInfo.antall));

  // Info
  log({ data: `🖊 filling in ${orderInfo.fornavn}` });
  await page.locator("#first").fill(orderInfo.fornavn);
  log({ data: `🖊 filling in ${orderInfo.etternavn}` });
  await page.locator("#last").fill(orderInfo.etternavn);
  log({ data: `🖊 filling in ${orderInfo.epost}` });
  await page.locator("#email").fill(orderInfo.epost);
  log({ data: `🖊 filling in ${orderInfo.mobil}` });
  await page.locator("#mobile_number_param").fill(orderInfo.mobil);

  // Accept terms
  log({ data: `☑️ accepting terms` });
  await page.locator("#rental_prop_agreement").check();

  // Next
  log({ data: `🤘 clicking submit` });
  await page.locator("#submit_button").click();

  // Info
  const shoppingCart = {
    name: await page.locator(".cart-item .resource-contents h4").textContent(),
    time: await page
      .locator(".cart-item .resource-contents .lead")
      .textContent(),
    price: await page.locator(".cart-item .price").textContent(),
  };
  log({ data: `🛒 shooping card ${JSON.stringify(shoppingCart, null, 2)}` });

  // Confirm
  log({ data: `🤘 clicking Bekreft/Betal` });
  await page.getByText("Bekreft/Betal").click();

  // Info
  const orderLine = {
    reservationId: await page.locator("tbody > tr .col_id").textContent(),
    name: await page.locator("tbody > tr .col_id").textContent(),
    time: await page.locator("tbody > tr .col_time").textContent(),
    price: await page.locator("tbody > tr .col_price").textContent(),
  };
  log({ data: `📠 order line ${JSON.stringify(orderLine, null, 2)}` });

  // Pay
  log({ data: `🤘 clicking Betal nå` });
  await page.getByText("Betal nå").click();

  // Pay with Vipps
  log({ data: `🤘 Pay with vipps` });
  await page.locator("#paymentMethodHeading_vipps").click();

  log({ data: `🖊 filling in ${orderInfo.mobil}` });
  await page.locator("#vippsPhonenumber").fill(orderInfo.mobil);
  await page.locator("#vippsPhonenumber").blur();

  // Request payment
  log({ data: `🤘 go to Vipps` });
  await page.locator("#vippsContinueBtn").click();
  return;

  // Click Vipps next button
  // Number is autofilled
  log({ data: `💰 clicking final Vipps button` });
  await page.locator(".primary-button").click();

  log({ data: `⏳ waiting for payment in Vipps app` });

  await page.waitForLoadState();
  log({ data: "got load state" });

  await cleanup();
}

// export async function getSteder(page: playwright.Page) {
//   await page.goto("https://oslobadstuforening.no/sok-dropin/");

//   const options = await page.locator("#box_prop_res_sted > option").all();
//   return (
//     await Promise.all(options.map((option) => option.getAttribute("value")))
//   ).filter((sted) => sted !== "none");
// }

const envVariables = z.object({
  PASSWORD: z.string().nonempty(),
});
envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
