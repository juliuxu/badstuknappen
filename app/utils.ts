// https://www.mywebtuts.com/blog/how-to-get-next-sunday-date-in-javascript
function nextDate(dayIndex: number) {
  const today = new Date();
  today.setDate(today.getDate() + ((7 - today.getDay() + dayIndex) % 7 || 7));
  // HACK
  today.setHours(6);
  return today;
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

export function ukedagToDate(value: Ukedag) {
  const dayToDayIndex: Record<Ukedag, number> = {
    mandag: 1,
    tirsdag: 2,
    onsdag: 3,
    torsdag: 4,
    fredag: 5,
    lørdag: 6,
    søndag: 0,
  };
  return nextDate(dayToDayIndex[value]).toISOString().split("T")[0];
}

// export async function getSteder(page: playwright.Page) {
//   await page.goto("https://oslobadstuforening.no/sok-dropin/");

//   const options = await page.locator("#box_prop_res_sted > option").all();
//   return (
//     await Promise.all(options.map((option) => option.getAttribute("value")))
//   ).filter((sted) => sted !== "none");
// }
