import type { V2_MetaFunction } from "@remix-run/node";
import { useState } from "react";

const title = "Super Badstu Bestiller";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export default function Component() {
  const [url, setUrl] = useState("http://test");
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
        <label>
          Date
          <input
            required
            name="date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
          />
        </label>
        <label>
          Time
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
        {/* <button type="button" className="outline contrast">
          Bygg URL
        </button> */}
      </form>
    </main>
  );
}
