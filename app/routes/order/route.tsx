import { useState } from "react";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

import aerfuglSound from "~/assets/aerfugl-oh.mp3";
import { getOrderInfoFromUrl } from "../../schema/order-info.server";
import { requirePassword } from "../login/route";
import { OrderStatus } from "../api.order/order-status";
import { showConfetti } from "./confetti.client";
import { FormattedTimeAndPlace } from "~/utils";
import { serializePersonInfoToCookie } from "~/schema/person-info.server";

const title = "🧖 Bestill Badstue 🌊";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export const loader = async ({ request }: LoaderArgs) => {
  requirePassword(request);
  const orderInfo = getOrderInfoFromUrl(request.url);
  return json(
    { orderInfo },
    { headers: { "Set-Cookie": await serializePersonInfoToCookie(orderInfo) } }
  );
};

type EventType = {
  time: string;
  data: any;
};
export default function Component() {
  const [searchParams] = useSearchParams();
  const orderUrl = `/api/order?${searchParams}`;

  const [eventLog, setEventLog] = useState<EventType[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | undefined>(
    undefined
  );

  // Play the sound of the Ærfugl when ordering
  const [sound] = useState(() => {
    if (typeof window === "undefined") return undefined;
    const sound = new Audio(aerfuglSound);
    sound.preload = "auto";
    return sound;
  });

  const onSuccessfullOrder = () => {
    // Play some sounds
    Array(6)
      .fill(0)
      .forEach((i) => {
        new Audio(aerfuglSound).play();
        setTimeout(() => new Audio(aerfuglSound).play(), 100 + i * 50);
      });

    // And show some confetti
    showConfetti();
  };

  const order = () => {
    sound?.play();

    setEventLog([]);
    const eventSource = new EventSource(orderUrl);
    eventSource.addEventListener("error", () => {
      eventSource.close();
    });
    eventSource.addEventListener("status", (message) => {
      const status = message.data as OrderStatus;
      setOrderStatus(status);
      if (status === OrderStatus.DONE) {
        if (document.visibilityState === "hidden") {
          document.addEventListener("visibilitychange", onSuccessfullOrder, {
            once: true,
          });
        } else {
          onSuccessfullOrder();
        }
      }
    });
    eventSource.addEventListener("message", (message) => {
      setEventLog((currentEventLog) => [
        { data: message.data, time: new Date().toISOString() },
        ...currentEventLog,
      ]);
    });
    return () => {
      eventSource.close();
    };
  };

  const { orderInfo } = useLoaderData<typeof loader>();

  return (
    <>
      <main className="container">
        {/* Order Summary */}
        <article style={{ marginTop: 0 }}>
          <header aria-busy={orderStatus && orderStatus !== OrderStatus.DONE}>
            {orderStatus === OrderStatus.DONE ? (
              <>🎉 Badstu er bestilt 🎉</>
            ) : (
              "Bestill badstu"
            )}
          </header>
          <strong>
            {orderInfo.fornavn} {orderInfo.etternavn}{" "}
          </strong>
          <i>({orderInfo.isMember ? "medlem" : "ikke medlem"})</i>
          <br />
          <span>{orderInfo.epost}</span>
          <br />
          <span>{orderInfo.mobil}</span>
          <br />
          <strong>{orderInfo.antall}</strong>{" "}
          {orderInfo.antall === 1 ? "billett" : "billetter"}
          <br />
          <FormattedTimeAndPlace {...orderInfo} />
        </article>

        <div>
          {orderStatus === undefined && (
            <button onClick={order}>Bestill</button>
          )}

          {orderStatus && (
            <pre
              style={{
                aspectRatio: "1 / 1",
                width: "100%",
                maxHeight: "35vh",
              }}
            >
              <code
                style={{
                  height: "100%",
                  display: "flex",
                  overflow: "auto",
                  flexDirection: "column-reverse",
                  gap: "4px",
                }}
              >
                {eventLog.map((event) => (
                  <div key={JSON.stringify(event)}>{event.data}</div>
                ))}
              </code>
            </pre>
          )}
        </div>

        {orderInfo.useMock && <MockDisclaimer />}
      </main>
    </>
  );
}

function MockDisclaimer() {
  return (
    <div
      style={{
        border: "4px solid hsl(142, 81%, 50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        marginBottom: 32,
      }}
    >
      <hgroup style={{ textAlign: "center" }}>
        <h2>🧪 Mock mode 🧪</h2>
        <small>Simulert bestilling for bruk under testing</small>
      </hgroup>
    </div>
  );
}
