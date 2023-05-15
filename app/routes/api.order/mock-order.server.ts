import { OrderStatus } from "./order-status";
import type { placeOrder } from "./order.server";
import { buildOrderUrl } from "./order.server";

export const mockPlaceOrder: typeof placeOrder = async (
  orderInfo,
  log,
  abortController
) => {
  log({ event: "status", data: OrderStatus.PENDING });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (let _ of Array(5).fill(0)) {
    log({ data: "🧪🧪 MOCK 🧪🧪" });
    await sleep(100);
  }

  if (orderInfo.password !== process.env.PASSWORD) {
    log({ data: `❌ WRONG PASSWORD ❌` });
    abortController.abort();
    return;
  }

  log({
    data: `🤖 Ordering with info: ${JSON.stringify(orderInfo)}`,
  });

  await sleep(300);
  const orderUrl = buildOrderUrl(orderInfo);
  log({ data: `🧭 navigating to ${orderUrl}` });

  await sleep(300);
  log({ event: "status", data: OrderStatus.CLICKING_BUTTONS });
  log({ data: `🖊 filling in ${orderInfo.fornavn}` });

  await sleep(300);
  log({ data: `🖊 filling in ${orderInfo.etternavn}` });

  await sleep(300);
  log({ data: `🖊 filling in ${orderInfo.epost}` });

  await sleep(300);
  log({ data: `🖊 filling in ${orderInfo.mobil}` });

  await sleep(300);
  log({ data: `☑️ accepting terms` });

  await sleep(300);
  log({ event: "status", data: OrderStatus.CLICKING_BUTTONS });
  log({ data: `🤘 clicking submit` });

  await sleep(300);
  log({ data: `🛒 shooping card ${"MOCK"}` });

  await sleep(300);
  log({ data: `🤘 clicking Bekreft/Betal` });

  await sleep(300);
  log({ data: `📠 order line ${"MOCK"}` });

  await sleep(300);
  log({ event: "status", data: OrderStatus.REQUESTING_PAYMENT });
  log({ data: `🤘 clicking Betal nå` });

  await sleep(300);
  log({ data: `🤘 Pay with vipps` });

  await sleep(300);
  log({ data: `🖊 filling in ${orderInfo.mobil}` });

  await sleep(300);
  log({ data: `🤘 go to Vipps` });

  await sleep(300);
  log({ data: `💸 vippps: ${"MOCK"}` });

  await sleep(300);
  log({ data: `🤘 clicking final Vipps button` });

  await sleep(300);
  log({ event: "status", data: OrderStatus.WAITING_FOR_PAYMENT });
  log({ data: `⏳ waiting for payment in Vipps app` });

  await sleep(2000);
  log({ event: "status", data: OrderStatus.DONE });
  log({ data: `✅ done: ${"MOCK"}` });

  abortController.abort();
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
