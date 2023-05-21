import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import {
  capitalize,
  dateToDashedDateString,
  isLocalUrl,
  nesteUkedagToDate,
  ukedager,
} from "~/utils";
import style from "./style.css";
import { requirePassword } from "../login/route";
import type { Share } from "~/schema/share.server";
import { safeParseShareFromUrl } from "~/schema/share.server";
import { safeParseTimeAndPlaceFromUrl } from "~/schema/time-and-place.server";
import {
  safeParsePersonInfoFromCookie,
  safeParsePersonInfoFromUrl,
} from "~/schema/person-info.server";
import { getOtherFromUrl } from "~/schema/order-info.server";
import { YouHaveBeenInvitedMessage, buildShareLinkAndData } from "./share";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }];

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  // When shared
  if (data?.share) {
    const { shareData } = buildShareLinkAndData(data.share as Share);
    return [
      { title: shareData.title },
      {
        name: "description",
        content: shareData.text,
      },
      {
        name: "og:image",
        content: `${
          data.isLocal
            ? "http://localhost:3000"
            : "https://badstuknappen.julianjark.no"
        }/api/og?${new URLSearchParams(data.share)}`,
      },
    ];
  }

  // Default
  return [
    { title: "Badstuknappen" },
    {
      name: "description",
      content: "Beste måten å bestille ditt neste badstu besøk på",
    },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  requirePassword(request);
  return json({
    isLocal: isLocalUrl(request.url),
    share: safeParseShareFromUrl(request.url),
    timeAndPlace: safeParseTimeAndPlaceFromUrl(request.url),
    personInfo:
      safeParsePersonInfoFromUrl(request.url) ??
      (await safeParsePersonInfoFromCookie(request.headers.get("Cookie"))),
    other: getOtherFromUrl(request.url),
  });
};

export default function Component() {
  const { isLocal, share, timeAndPlace, personInfo, other } =
    useLoaderData<typeof loader>();

  // Date selector logic
  const [dateFormat, setDateformat] = useState<"relative" | "absolute">(
    timeAndPlace?.relativeDate ? "relative" : "absolute"
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
      {share && (
        <div id="top-alert">
          <Alert>{<YouHaveBeenInvitedMessage {...share} />}</Alert>
        </div>
      )}
      <form action="/order" method="get">
        <input hidden readOnly name="password" value={other.password} />

        <div className="grid">
          <article>
            <h2>Tid og sted</h2>
            <label>
              Sted
              <select required name="sted" defaultValue={timeAndPlace?.sted}>
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
                        defaultChecked={
                          timeAndPlace?.relativeDate === `neste-${dag}`
                        }
                        required
                        onClick={() => {
                          // Preview the date
                          document.querySelector<HTMLInputElement>(
                            `input[name="date"][type="date"]`
                          )!.value = nesteUkedagToDate(dag);
                        }}
                      />
                      {capitalize(dag)}
                    </label>
                  ))}
                </fieldset>
              </div>
              <div onClick={() => setDateformat("absolute")}>
                <label>
                  Eller dato
                  <input
                    defaultValue={timeAndPlace && timeAndPlace.date}
                    disabled={dateFormat !== "absolute"}
                    required
                    name="date"
                    type="date"
                    min={dateToDashedDateString(new Date())}
                  />
                </label>
              </div>
            </div>
            <label>
              Tidspunkt
              <input
                defaultValue={timeAndPlace?.time}
                required
                name="time"
                inputMode="numeric"
                placeholder="e.g. 07, 8.5, 10"
              />
            </label>
          </article>
          {share && (
            <div id="middle-alert">
              <Alert>{<YouHaveBeenInvitedMessage {...share} />}</Alert>
            </div>
          )}
          <article>
            <h2>Din informasjon</h2>
            <fieldset>
              <label>
                <input
                  name="isMember"
                  role="switch"
                  type="checkbox"
                  autoComplete="off"
                  defaultChecked={personInfo ? personInfo.isMember : true}
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
              <select required name="antall" defaultValue={personInfo?.antall}>
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
                  autoFocus={Boolean(share)}
                  required
                  name="fornavn"
                  type="text"
                  defaultValue={personInfo?.fornavn}
                />
              </label>
              <label>
                Etternavn
                <input
                  required
                  name="etternavn"
                  type="text"
                  defaultValue={personInfo?.etternavn}
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
                  defaultValue={personInfo?.epost}
                />
              </label>
              <label>
                Mobil
                <input
                  required
                  name="mobil"
                  type="tel"
                  defaultValue={personInfo?.mobil}
                />
              </label>
            </div>
            <button type="submit">Neste</button>
          </article>
        </div>

        {isLocal && (
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

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        textAlign: "center",
        border: "4px solid var(--card-background-color)",
        borderRadius: "var(--border-radius)",
        boxShadow: "var(--card-box-shadow)",
        padding: 16,
      }}
    >
      {children}
    </p>
  );
}
