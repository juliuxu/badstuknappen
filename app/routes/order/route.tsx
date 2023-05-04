import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { getOrderInfo } from "../api.order/schema";

const title = "🧖 Bestill Badstue 🌊";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export const loader = ({ request }: LoaderArgs) => {
  const orderInfo = getOrderInfo(request.url);
  return json({ orderInfo });
};

type EventType = {
  time: string;
  data: any;
};
export default function Component() {
  const [searchParams] = useSearchParams();
  const relativeUrl = `/api/order?${searchParams}`;

  const [isOrdering, setIsOrdering] = useState(false);
  const [eventLog, setEventLog] = useState<EventType[]>([]);

  const order = () => {
    setIsOrdering(true);
    setEventLog([]);
    const eventSource = new EventSource(relativeUrl);
    eventSource.addEventListener("error", () => {
      eventSource.close();
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

  // Formatting
  const formatter = new Intl.DateTimeFormat("no-nb", { dateStyle: "full" });

  // 07 -> 07:00
  // 7 -> 07:00
  // 8.5 -> 08:30
  const shortTimeToClockTime = (timeString: string) => {
    const leftPart = timeString.split(".")[0].padStart(2, "0");
    let rightPart = timeString.split(".")[1] ?? "00";
    rightPart = rightPart.replace("5", "30");
    return `${leftPart}:${rightPart}`;
  };

  return (
    <main className="container">
      <h1>{title}</h1>
      {/* INFO */}
      <p>
        <strong>
          {orderInfo.fornavn} {orderInfo.etternavn}
        </strong>
        {" bestill "}
        {orderInfo.antall} {orderInfo.antall === 1 ? "billett" : "billetter"}
        {" på "}
        <strong>{orderInfo.sted}</strong>
        {" for "}
        {" klokken "}
        <time>{shortTimeToClockTime(orderInfo.time)}</time>{" "}
        <time>{formatter.format(new Date(orderInfo.date))}</time>
      </p>
      <div>
        {!isOrdering && (
          <button
            onClick={order}
            className="outline"
            style={{
              aspectRatio: "1 / 0.7",
              width: "100%",
              maxHeight: "70vh",
            }}
          >
            Bestill
          </button>
        )}

        {isOrdering && (
          <pre
            style={{
              aspectRatio: "1 / 1",
              width: "100%",
              maxHeight: "70vh",
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
    </main>
  );
}
