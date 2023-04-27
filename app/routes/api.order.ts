import type { LoaderArgs } from "@remix-run/node";
import { getOrderInfo, placeOrder } from "./order/order.server";
import { eventStream } from "remix-utils";

export const loader = async ({ request }: LoaderArgs) => {
  const orderInfo = getOrderInfo(request.url);

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  return eventStream(abortController.signal, function setup(send) {
    console.log(`ℹ️ new order request`);
    const alsoLogOnServerSend: typeof send = ({ data, event }) => {
      console.log(`${event ?? "message"}: ${data}`);
      send({ data, event });
    };
    placeOrder(orderInfo, alsoLogOnServerSend, abortController);
    return function clear() {};
  });
};
