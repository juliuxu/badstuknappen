// https://stackoverflow.com/questions/1579010/get-next-date-from-weekday-in-javascript
function nextDate(dayIndex: number) {
  const date = new Date();
  date.setDate(date.getDate() + ((dayIndex + (7 - date.getDay())) % 7));
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

export function nesteUkedagToDate(value: Ukedag) {
  const dayToDayIndex: Record<Ukedag, number> = {
    mandag: 1,
    tirsdag: 2,
    onsdag: 3,
    torsdag: 4,
    fredag: 5,
    lørdag: 6,
    søndag: 0,
  };
  console.log(
    `nesteUkedagToDate: ${nextDate(dayToDayIndex[value]).toDateString()}`
  );
  if (dayToDayIndex[value] === undefined) {
    throw new Error(`invalid ukedag ${value}`);
  }

  return nextDate(dayToDayIndex[value]).toISOString().split("T")[0];
}

// export async function getSteder(page: playwright.Page) {
//   await page.goto("https://oslobadstuforening.no/sok-dropin/");

//   const options = await page.locator("#box_prop_res_sted > option").all();
//   return (
//     await Promise.all(options.map((option) => option.getAttribute("value")))
//   ).filter((sted) => sted !== "none");
// }
