import playwright from "playwright";
import type { OrderInfo } from "./schema";

const stedToStedId: Record<OrderInfo["sted"], string> = {
  sukkerbiten: "184637%27,184637)",
  langkaia: "189278%27,189278)",
};

interface OrderUrlInfo {
  sted: OrderInfo["sted"];
  date: string; // "05.05.2023"
  time: string; // "07"
}
export const buildOrderUrl = ({ sted, date, time }: OrderUrlInfo) => {
  const stedId = stedToStedId[sted];
  return `https://www.planyo.com/booking.php?planyo_lang=NO&mode=reserve&prefill=true&one_date=${date}&start_date=${date}&start_time=${time}&resource_id=${stedId}`;
};

export async function placeOrder(
  orderInfo: OrderInfo,
  log: (obj: { event?: string; data: string }) => void,
  abortController: AbortController
) {
  if (orderInfo.password !== process.env.PASSWORD) {
    log({ data: `❌ WRONG PASSWORD ❌` });
    abortController.abort();
    return;
  }

  log({
    data: `🤖 Ordering with info: ${JSON.stringify(orderInfo)}`,
  });

  // Start playwright
  const browser = await playwright.chromium.launch({
    headless: !orderInfo.debug,
    slowMo: orderInfo.debug ? 400 : 200,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(120 * 1000);

  try {
    await innerPlaceOrder();
  } catch (e) {
    log({ data: `❌ got error ${e}` });
  } finally {
    // Cleanup
    if (!orderInfo.debug) {
      await context.close();
      await browser.close();
    }
    abortController.abort();
  }

  function throwIfAborted() {
    if (abortController.signal.aborted) {
      throw new Error("aborted");
    }
  }
  async function innerPlaceOrder() {
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
      throw new Error(
        `❌ chosen time ${orderInfo.time} does not match selected start time ${startTimeValue}`
      );
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
    throwIfAborted();
    log({ data: `🤘 clicking submit` });
    await page.locator("#submit_button").click();

    // Info
    const shoppingCart = {
      name: await page
        .locator(".cart-item .resource-contents h4")
        .textContent(),
      time: await page
        .locator(".cart-item .resource-contents .lead")
        .first()
        .textContent(),

      ...((await page
        .locator(".cart-item .resource-contents .lead")
        .nth(1)
        .count()) === 1
        ? {
            amount: await page
              .locator(".cart-item .resource-contents .lead")
              .nth(1)
              .textContent(),
          }
        : {}),

      price: await page.locator(".cart-item .price").textContent(),
    };
    log({ data: `🛒 shooping card ${JSON.stringify(shoppingCart)}` });

    // Confirm
    throwIfAborted();
    log({ data: `🤘 clicking Bekreft/Betal` });
    await page.getByText("Bekreft/Betal").click();

    // Info
    const orderLine = {
      reservationId: await page.locator("tbody > tr > td.col_id").textContent(),
      name: await page.locator("tbody > tr > td.col_res").textContent(),
      time: await page.locator("tbody > tr > td.col_time").textContent(),
      price: await page.locator("tbody > tr > td.col_price").textContent(),
    };
    log({ data: `📠 order line ${JSON.stringify(orderLine)}` });

    // Pay
    throwIfAborted();
    log({ data: `🤘 clicking Betal nå` });
    await page.getByText("Betal nå").click();

    // Pay with Vipps
    throwIfAborted();
    log({ data: `🤘 Pay with vipps` });
    await page.locator("#paymentMethodHeading_vipps").click();

    log({ data: `🖊 filling in ${orderInfo.mobil}` });
    await page.locator("#vippsPhonenumber").fill(orderInfo.mobil);
    await page.locator("#vippsPhonenumber").blur();

    // Request payment
    throwIfAborted();
    log({ data: `🤘 go to Vipps` });
    await page.locator("#vippsContinueBtn").click();

    const vippsOrderLine = await page
      .locator("main .description")
      .first()
      .textContent();
    log({ data: `💸 vippps: ${vippsOrderLine}` });

    // Click Vipps next button
    // Number is autofilled
    throwIfAborted();
    log({ data: `🤘 clicking final Vipps button` });
    await page.locator(".primary-button").click();

    log({ data: `⏳ waiting for payment in Vipps app` });

    await page.waitForLoadState();
    log({ data: "got load state" });

    throwIfAborted();
    const reservantionLine = await page
      .locator(".rental-id")
      .first()
      .textContent();
    log({ data: `✅ done: ${reservantionLine}` });
  }
}
