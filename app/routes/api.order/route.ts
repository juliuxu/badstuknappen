import type { LoaderArgs } from "@remix-run/node";
import { placeOrder } from "./order.server";
import { eventStream } from "remix-utils";
import { getOrderRequestFromUrl } from "./schema.server";
import { mockPlaceOrder } from "./mock-order.server";
import { requirePassword } from "../login/route";

export const loader = async ({ request }: LoaderArgs) => {
  requirePassword(request);
  const orderInfo = getOrderRequestFromUrl(request.url);

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  return eventStream(abortController.signal, function setup(send) {
    console.log("ℹ️ new order request");
    const alsoLogOnServerSend: typeof send = ({ data, event }) => {
      console.log(
        `[${new Date().toISOString()}] ${event ?? "message"}: ${data}`
      );
      if (!abortController.signal.aborted) {
        send({ data, event });
      }
    };
    if (orderInfo.useMock) {
      mockPlaceOrder(orderInfo, alsoLogOnServerSend, abortController);
    } else {
      placeOrder(orderInfo, alsoLogOnServerSend, abortController);
    }
    return function clear() {
      console.log("ℹ️ order request done");
    };
  });
};
