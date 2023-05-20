import type { TimeAndPlace } from "./schema/time-and-place.server";

// https://stackoverflow.com/questions/1579010/get-next-date-from-weekday-in-javascript
function nextDate(dayIndex: number, fromDate: Date) {
  const date = new Date(fromDate);

  // Lock the time to the middle of the day to try to ensure no silly-ness with
  // daylight savings time changes
  // hopefully this does not cause more problems than it tries to solve
  date.setHours(12);

  date.setDate(date.getDate() + ((dayIndex + (7 - date.getDay())) % 7 || 7));
  return date;
}

export const ukedager = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
] as const;
export type Ukedag = typeof ukedager[number];

export function nesteUkedagToDate(value: Ukedag, fromDate = new Date()) {
  const ukedagToDayIndex: Record<Ukedag, number> = {
    mandag: 1,
    tirsdag: 2,
    onsdag: 3,
    torsdag: 4,
    fredag: 5,
    lørdag: 6,
    søndag: 0,
  };
  if (ukedagToDayIndex[value] === undefined) {
    throw new Error(`invalid ukedag ${value}`);
  }

  const date = nextDate(ukedagToDayIndex[value], fromDate);

  // Format the date, like so 2023-05-03
  // Using the system timezone
  // using `toISOString` causes the timezone to be different
  // resulting in wrong dates when the time is right after midnight (local time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
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

export function formattedTimeAndPlace({ time, date, sted }: TimeAndPlace) {
  const { formattedDate, formatedClockTime } = formatDateTime({ time, date });
  return `${formatedClockTime} ${formattedDate} på ${capitalize(sted)}`;
}
export function FormattedTimeAndPlace({ time, date, sted }: TimeAndPlace) {
  const { formattedDate, formatedClockTime } = formatDateTime({ time, date });
  return (
    <>
      <strong>
        {formatedClockTime} {formattedDate}
      </strong>
      {" på "}
      <strong>{capitalize(sted)}</strong>
    </>
  );
}

export function assertUnreachable(x: never): never {
  const error = new Error(`Unknown value ${x}`);
  console.error(`assertUnreachable`, error);
  throw error;
}

export function isLocalUrl(url: string) {
  const { hostname } = new URL(url);
  return (
    hostname.includes("192.168") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("localhost")
  );
}

export function capitalize(s?: string | null) {
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1);
}
