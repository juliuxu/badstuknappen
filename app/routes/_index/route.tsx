import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { nesteUkedagToDate, ukedager } from "~/utils";
import style from "./style.css";
import { requirePassword } from "../login/route";
import { formatDateTime } from "../order/route";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }];

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

  const defaultDate = search.get("date") ?? undefined;

  // Date selector logic
  const [dateFormat, setDateformat] = useState<"relative" | "absolute">(
    defaultDate === undefined || defaultDate?.startsWith("neste-")
      ? "relative"
      : "absolute"
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

  let shareMessage = undefined;
  if (
    search.get("share") &&
    search.get("sted") &&
    search.get("time") &&
    defaultDate !== undefined
  ) {
    const date = defaultDate.startsWith("neste-")
      ? nesteUkedagToDate(defaultDate.split("-")[1] as any)
      : defaultDate;
    const time = search.get("time") ?? "18:00";
    const { formattedDate, formatedClockTime } = formatDateTime({ date, time });
    shareMessage = (
      <>
        🎉 Du har blitt invitert med i badstuen{" "}
        <strong>
          {formatedClockTime} {formattedDate}
        </strong>{" "}
        på{" "}
        <strong>
          {search.get("sted")![0].toLocaleUpperCase() +
            search.get("sted")!.slice(1)}
        </strong>
        . Bli med da vell 🧖
      </>
    );
  }

  return (
    <main className="container">
      {shareMessage && (
        <p
          style={{
            textAlign: "center",
            border: "4px solid var(--card-background-color)",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--card-box-shadow)",
            padding: 16,
          }}
        >
          {shareMessage}
        </p>
      )}

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
              <select
                required
                name="sted"
                defaultValue={search.get("sted") ?? undefined}
              >
                <option value="sukkerbiten">Sukkerbiten</option>
                <option value="langkaia">Langkaia</option>
              </select>
              <small>
                Se ledige{" "}
                <a
                  href="https://badstu.karl.run/"
                  target="_blank"
                  rel="noreferrer"
                >
                  badstutimer ↗
                </a>
              </small>
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
                        defaultChecked={defaultDate === `neste-${dag}`}
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
                    defaultValue={
                      defaultDate !== undefined &&
                      !defaultDate?.startsWith("neste-")
                        ? defaultDate
                        : undefined
                    }
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
                defaultValue={search.get("time") ?? undefined}
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
                  autoComplete="off"
                  // Hack to know when the form has been previously
                  // prefilled
                  // When the checkbox is unchecked, the value is not sent
                  defaultChecked={
                    search.get("antall") === null
                      ? true
                      : search.get("isMember") === "on"
                  }
                />
                Er medlem
                <small style={{ marginTop: 8 }}>
                  Få billigere billettpris og støtt Oslo Badstuforening.{" "}
                  <a
                    href="https://oslobadstuforening.no/bli-medlem/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Bli medlem her ↗
                  </a>
                </small>
              </label>
            </fieldset>
            <label>
              Antall
              <select
                required
                name="antall"
                defaultValue={search.get("antall") ?? undefined}
              >
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
                <input
                  autoFocus={search.get("share") === "true"}
                  required
                  name="fornavn"
                  type="text"
                  defaultValue={search.get("fornavn") ?? undefined}
                />
              </label>
              <label>
                Etternavn
                <input
                  required
                  name="etternavn"
                  type="text"
                  defaultValue={search.get("etternavn") ?? undefined}
                />
              </label>
            </div>
            <div className="grid">
              <label>
                Epost
                <input
                  required
                  name="epost"
                  type="email"
                  defaultValue={search.get("epost") ?? undefined}
                />
              </label>
              <label>
                Mobil
                <input
                  required
                  name="mobil"
                  type="tel"
                  defaultValue={search.get("mobil") ?? undefined}
                />
              </label>
            </div>
            <button type="submit">Neste</button>
          </article>
        </div>

        {isLocal && true && (
          <article>
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
      </form>
    </main>
  );
}
