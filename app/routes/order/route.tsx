import { useState } from "react";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import confetti from "canvas-confetti";

import aerfuglSound from "~/assets/aerfugl-oh.mp3";
import { getOrderInfo } from "../api.order/schema.server";
import { requirePassword } from "../login/route";

const title = "🧖 Bestill Badstue 🌊";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export const loader = ({ request }: LoaderArgs) => {
  requirePassword(request);
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

  // Play the sound of the Ærfugl when ordering
  const [sound] = useState(() => {
    if (typeof window === "undefined") return undefined;
    const sound = new Audio(aerfuglSound);
    sound.preload = "auto";
    return sound;
  });

  const order = () => {
    sound?.play();

    setIsOrdering(true);
    setEventLog([]);
    const eventSource = new EventSource(relativeUrl);
    eventSource.addEventListener("error", () => {
      eventSource.close();
    });
    eventSource.addEventListener("message", (message) => {
      if (message.data.includes("✅ done")) {
        if (document.visibilityState === "hidden") {
          document.addEventListener(
            "visibilitychange",
            () => {
              showConfetti();
            },
            { once: true }
          );
        } else {
          showConfetti();
        }
      }

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

  const orderClockTime = shortTimeToClockTime(orderInfo.time);
  const orderDate = formatter.format(new Date(orderInfo.date));

  return (
    <>
      {/* Order Summary */}
      <header className="container">
        <strong>
          {orderInfo.fornavn} {orderInfo.etternavn}
        </strong>
        {" bestill "}
        {orderInfo.antall} {orderInfo.antall === 1 ? "billett" : "billetter"}
        {" på "}
        <strong>{orderInfo.sted}</strong>
        {" for "}
        {" klokken "}
        <time>{orderClockTime}</time> <time>{orderDate}</time>
      </header>
      <main className="container">
        <div className="container-fluid">
          <a href={`/`} role="button" className="outline contrast">
            🖊️ Endre bestilling
          </a>
          <button className="outline contrast">
            🔗 Del {orderInfo.sted} {orderClockTime} {orderDate}
          </button>
        </div>

        <div>
          {!isOrdering && <button onClick={order}>Bestill</button>}

          {isOrdering && (
            <pre
              style={{
                aspectRatio: "1 / 1",
                width: "100%",
                maxHeight: "60vh",
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

        {orderInfo.useMock && (
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
        )}
      </main>
    </>
  );
}

// Show confetti when ordering is done
function showConfetti() {
  setTimeout(showConfettiInner, 200);
  setTimeout(showConfettiInner, 600);
  setTimeout(showConfettiInner, 800);
  function showConfettiInner() {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: Parameters<typeof confetti>[0]) {
      confetti(
        Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio),
        })
      );
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }
}
