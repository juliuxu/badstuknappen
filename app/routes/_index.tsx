import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { nesteUkedagToDate, ukedager } from "~/utils";
import { requirePassword } from "./login/route";

const title = "Badstuknappen";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export const loader = ({ request }: LoaderArgs) => {
  requirePassword(request);
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
      <form action="/order" method="get">
        <input
          hidden
          readOnly
          name="password"
          value={search.get("password") ?? ""}
        />

        <div className="grid">
          <article>
            <h2>Tid og sted</h2>
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
          </article>

          <article>
            <h2>Din informasjon</h2>
            <fieldset>
              <label>
                <input
                  name="isMember"
                  role="switch"
                  type="checkbox"
                  defaultChecked
                />
                Er medlem
              </label>
              <small>
                Få billigere billettpris og støtt Oslo Badstuforening.{" "}
                <a
                  href="https://oslobadstuforening.no/bli-medlem/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bli medlem her ↗
                </a>
              </small>
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
          </article>
        </div>

        {isLocal && (
          <article
            style={{ marginTop: "calc(- var(--block-spacing-vertical))" }}
          >
            <h2>Utvikler opsjoner</h2>
            <fieldset>
              <label>
                <input name="debug" role="switch" type="checkbox" />
                Debug
              </label>
            </fieldset>
            <fieldset>
              <label>
                <input name="useMock" role="switch" type="checkbox" />
                Use mock
              </label>
            </fieldset>
          </article>
        )}

        <button type="submit">Neste</button>
      </form>
    </main>
  );
}
