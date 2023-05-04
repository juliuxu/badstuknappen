import type { V2_MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useState } from "react";

const title = "🧖 Bestill Badstue 🌊";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
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

  return (
    <main className="container">
      <h1>{title}</h1>
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
