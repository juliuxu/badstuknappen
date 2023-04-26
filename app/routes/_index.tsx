import type { V2_MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { date } from "zod";

const title = "Super Badstu Bestiller";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export default function Component() {
  const [url, setUrl] = useState("http://test");
  const [dateFormat, setDateformat] = useState<"relative" | "absolute">(
    "relative"
  );
  useEffect(() => {
    if (dateFormat === "absolute") {
      document
        .querySelectorAll("input[name='date'][type='radio']")
        ?.forEach((input) => {
          (input as HTMLInputElement).checked = false;
        });
    }
  }, [dateFormat]);

  return (
    <main className="container">
      <h1>{title}</h1>

      {url && (
        <>
          <h2 id="url">URL</h2>
          <pre>
            <code>{url}</code>
          </pre>
          <a href={url}>{url}</a>
        </>
      )}

      <h2>URL Bygger</h2>

      <form
        action="/order"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();

          const form = new FormData(e.currentTarget);
          const actionUrl = new URL(window.location.href);
          actionUrl.pathname = "/order";
          actionUrl.search = new URLSearchParams(
            Object.fromEntries(form) as any
          ).toString();

          setUrl(actionUrl.toString());

          setTimeout(() => {
            document
              .getElementById("url")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
      >
        <label>
          Sted
          <select required name="sted">
            <option value="sukkerbiten">Sukkerbiten</option>
            <option value="langkaia">Langkaia</option>
          </select>
        </label>

        <div className="grid">
          <div onClick={() => setDateformat("relative")}>
            <fieldset disabled={dateFormat !== "relative"}>
              <legend>Velg neste</legend>
              {[
                "mandag",
                "tirsdag",
                "onsdag",
                "torsdag",
                "fredag",
                "lørdag",
                "søndag",
              ].map((dag) => (
                <label key={dag}>
                  <input type="radio" name="date" value={`neste-${dag}`} />
                  {dag[0].toUpperCase() + dag.slice(1)}
                </label>
              ))}
            </fieldset>
          </div>
          <div onClick={() => setDateformat("absolute")}>
            <label>
              Eller dato
              <input
                disabled={dateFormat !== "absolute"}
                required
                name="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
              />
            </label>
          </div>
        </div>
        <label>
          Tidspunkt
          <input required name="time" />
        </label>

        <fieldset>
          <label>
            <input name="isMember" role="switch" type="checkbox" />
            Medlem
          </label>
        </fieldset>

        <div className="grid">
          <label>
            Fornavn
            <input required name="fornavn" type="text" />
          </label>
          <label>
            Etternavn
            <input required name="etternavn" type="text" />
          </label>
        </div>
        <div className="grid">
          <label>
            Epost
            <input required name="epost" type="email" />
          </label>
          <label>
            Mobil
            <input required name="mobil" type="tel" />
          </label>
        </div>

        <button type="submit">Bygg url</button>
      </form>
    </main>
  );
}
