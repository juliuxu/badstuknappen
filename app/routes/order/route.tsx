import { useState } from "react";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react";
import confetti from "canvas-confetti";

import aerfuglSound from "~/assets/aerfugl-oh.mp3";
import type { OrderInfo } from "../api.order/schema.server";
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

  const onSuccess = () => {
    // Play some sounds
    Array(10)
      .fill(0)
      .forEach(() => {
        new Audio(aerfuglSound).play();
      });

    // And show some confetti
    showConfetti();
  };

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
          document.addEventListener("visibilitychange", onSuccess, {
            once: true,
          });
        } else {
          onSuccess();
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

  const { formattedDate, formatedClockTime } = formatDateTime({
    date: orderInfo.date,
    time: orderInfo.time,
  });

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
        {formatedClockTime} {formattedDate}
      </header>

      <main className="container">
        <div>
          {!isOrdering && <button onClick={order}>Bestill</button>}

          {isOrdering && (
            <pre
              style={{
                aspectRatio: "1 / 1",
                width: "100%",
                maxHeight: "50vh",
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

        {orderInfo.useMock && false && (
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

export function OrderActions() {
  const [searchParams] = useSearchParams();
  const data = useRouteLoaderData("routes/order");
  if (!data) return null;

  const { orderInfo } = data as { orderInfo: OrderInfo };

  const { formattedDate, formatedClockTime } = formatDateTime({
    date: orderInfo.date,
    time: orderInfo.time,
  });

  const editLink = `/?${searchParams}`;

  const { password, date, sted, time } = orderInfo;
  const shareLink = `/?${new URLSearchParams({
    password,
    date,
    sted,
    time,
    share: "true",
  })}`;
  const shareData = {
    title: `Badstue ${orderInfo.sted}`,
    text: `Bli med i badstuen ${formatedClockTime} ${formattedDate} på ${orderInfo.sted}`,
    url: shareLink,
  };
  return (
    <ul>
      <li>
        <a href={editLink} role="button" className="outline contrast">
          🖊️ Endre bestilling
        </a>
      </li>
      <li>
        <a
          data-placement="left"
          data-tooltip="Kopier denne lenken og send til en venn"
          target="_blank"
          href={shareLink}
          role="button"
          className="outline contrast"
          rel="noreferrer"
          onClick={(e) => {
            if (
              navigator.share !== undefined &&
              navigator.canShare(shareData)
            ) {
              e.preventDefault();
              console.log("sharing", shareData);
              navigator.share(shareData);
            }
          }}
        >
          🔗 Del
        </a>
      </li>
    </ul>
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

export function formatDateTime({
  time,
  date,
}: {
  time: string;
  date: string | Date;
}) {
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

  const formatedClockTime = shortTimeToClockTime(time);
  const formattedDate = formatter.format(new Date(date));

  return { formattedDate, formatedClockTime };
}
