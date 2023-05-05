import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { nesteUkedagToDate, ukedager } from "~/utils";

const title = "Badstuknappen";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export const loader = ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  return json({
    isLocal:
      url.hostname.includes("192.168") ||
      url.hostname.includes("127.0.0.1") ||
      url.hostname.includes("localhost"),
  });
};

export default function Component() {
  const { isLocal } = useLoaderData<typeof loader>();
  const [url, setUrl] = useState("");

  const [search] = useSearchParams();

  // Date selector logic
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
          <hgroup>
            <h2 id="url">🎉 Linken er klar 🎉</h2>
            <h3>Åpne linken når du er klar for å bestille</h3>
          </hgroup>
          <a href={url} target="_blank" rel="noreferrer">
            👉 Trykk her eller kopier linken for senere 👈
          </a>
          <br />
          <br />
          <pre>
            <code>{url}</code>
          </pre>
        </>
      )}

      <hgroup>
        <h2>URL Bygger</h2>
        <h3>Bygg din personlige badstue bestiller url</h3>
      </hgroup>
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
        <input
          hidden
          readOnly
          name="password"
          value={search.get("password") ?? ""}
        />
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
              {ukedager.map((dag) => (
                <label key={dag}>
                  <input
                    type="radio"
                    name="date"
                    value={`neste-${dag}`}
                    required
                    onClick={() => {
                      // Preview the date
                      document.querySelector<HTMLInputElement>(
                        `input[name="date"][type="date"]`
                      )!.value = nesteUkedagToDate(dag);
                    }}
                  />
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
          <input
            required
            name="time"
            inputMode="numeric"
            placeholder="e.g. 07, 8.5, 10"
          />
        </label>

        <fieldset>
          <label>
            <input
              name="isMember"
              role="switch"
              type="checkbox"
              defaultChecked
            />
            Medlem
          </label>
        </fieldset>
        <label>
          Antall
          <select required name="antall">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
          </select>
        </label>

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

        {isLocal && (
          <fieldset>
            <label>
              <input name="debug" role="switch" type="checkbox" />
              Debug
            </label>
          </fieldset>
        )}
        {isLocal && (
          <fieldset>
            <label>
              <input name="useMock" role="switch" type="checkbox" />
              Use mock
            </label>
          </fieldset>
        )}

        <button type="submit">Bygg url</button>
      </form>
    </main>
  );
}
