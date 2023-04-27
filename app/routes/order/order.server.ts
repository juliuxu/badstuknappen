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
        // https://www.mywebtuts.com/blog/how-to-get-next-sunday-date-in-javascript
        function nextDate(dayIndex: number) {
          const today = new Date();
          today.setDate(
            today.getDate() + ((7 - today.getDay() + dayIndex) % 7 || 7)
          );

          // HACK
          today.setHours(6);

          return today;
        }

        const nextDayToDayIndex: Record<typeof value, number> = {
          "neste-mandag": 1,
          "neste-tirsdag": 2,
          "neste-onsdag": 3,
          "neste-torsdag": 4,
          "neste-fredag": 5,
          "neste-lørdag": 6,
          "neste-søndag": 0,
        };

        console.log("⏰", nextDate(nextDayToDayIndex[value]).toDateString());
        console.log(
          "⏰",
          nextDate(nextDayToDayIndex[value]).toISOString().split("T")[0]
        );

        return nextDate(nextDayToDayIndex[value]).toISOString().split("T")[0];
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

  debug: z.boolean().default(false),
});
type OrderInfo = z.infer<typeof orderInfoSchema>;
export async function placeOrder(orderInfo: OrderInfo) {
  const browser = await playwright.chromium.launch({
    headless: !orderInfo.debug,
    slowMo: orderInfo.debug ? 100 : undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Url
  const orderUrl = buildOrderUrl(orderInfo);
  console.log("🧭 navigating to", orderUrl);
  page.goto(orderUrl);

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

  console.log("🏃 setting antall");
  await antallSelect.selectOption(String(orderInfo.antall));

  // Info
  await page.locator("#first").fill(orderInfo.fornavn);
  await page.locator("#last").fill(orderInfo.etternavn);
  await page.locator("#email").fill(orderInfo.epost);
  await page.locator("#mobile_number_param").fill(orderInfo.mobil);

  // Accept terms
  await page.locator("#rental_prop_agreement").check();

  // Next
  await page.locator("#submit_button").click();

  // Info
  const shoppingCart = {
    name: await page.locator(".cart-item .resource-contents h4").textContent(),
    time: await page
      .locator(".cart-item .resource-contents .lead")
      .textContent(),
    price: await page.locator(".cart-item .price").textContent(),
  };
  console.log("🛒 shooping card", shoppingCart);

  // Confirm
  await page.getByText("Bekreft/Betal").click();

  // Info
  const orderLine = {
    reservationId: await page.locator("tbody > tr .col_id").textContent(),
    name: await page.locator("tbody > tr .col_id").textContent(),
    time: await page.locator("tbody > tr .col_time").textContent(),
    price: await page.locator("tbody > tr .col_price").textContent(),
  };
  console.log("📠 order line", orderLine);

  // Pay
  console.log("Betal nå");
  await page.getByText("Betal nå").click();

  // Pay with Vipps
  console.log("Pay with vipps");
  await page.locator("#paymentMethodHeading_vipps").click();

  console.log("Fill number");
  await page.locator("#vippsPhonenumber").fill(orderInfo.mobil);
  await page.locator("#vippsPhonenumber").blur();

  // Request payment
  console.log("go to Vipps!");
  await page.locator("#vippsContinueBtn").click();

  // Click Vipps next button
  // Number is autofilled
  console.log("💰 clicking final Vipps button");
  await page.locator(".primary-button").click();

  if (!orderInfo.debug) page.close();
  return {
    data: buildOrderUrl(orderInfo),
  };
}

// export async function getSteder(page: playwright.Page) {
//   await page.goto("https://oslobadstuforening.no/sok-dropin/");

//   const options = await page.locator("#box_prop_res_sted > option").all();
//   return (
//     await Promise.all(options.map((option) => option.getAttribute("value")))
//   ).filter((sted) => sted !== "none");
// }
