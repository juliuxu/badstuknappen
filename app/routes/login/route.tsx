import type {
  ActionArgs,
  LinksFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import crypto from "crypto";
import saunaImg from "~/assets/DALL·E 2023-05-14 21.19.43 - a sauna by the oslofjord, synthwave style, 2d digital vector art.webp";
import style from "./style.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }];

const PASSWORD_KEY = "password";
export function requirePassword(fromRequest: Request) {
  const url = new URL(fromRequest.url);

  const password = url.searchParams.get(PASSWORD_KEY);
  const expectedPassword = process.env.PASSWORD;

  if (!password) {
    throw redirect("/login");
  }

  if (!safeCompare(password, expectedPassword)) {
    throw redirect("/login?cause=invalid-password");
  }
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const password = String(formData.get(PASSWORD_KEY));
  if (safeCompare(password, process.env.PASSWORD)) {
    return redirect(`/?password=${password}`);
  }

  return json({ success: false });
};

export const meta: V2_MetaFunction = () => [{ title: "Logg inn" }];

export default function Component() {
  const [searchParams] = useSearchParams();
  const cause = searchParams.get("cause");
  const message = cause === "invalid-password" ? "Feil passord" : undefined;

  const data = useActionData<typeof action>();
  const invalid = data?.success === false ? "true" : undefined;

  return (
    <main className="container">
      <article className="grid">
        <div>
          <hgroup>
            <h1>Logg inn</h1>
            <h2>Denne applikasjonen er passordbeskyttet</h2>
          </hgroup>

          <form method="post">
            <label htmlFor={PASSWORD_KEY}>Passord</label>
            <input
              aria-invalid={invalid}
              autoFocus
              required
              type="text"
              name={PASSWORD_KEY}
              id={PASSWORD_KEY}
            />
            {message && <small className="error">{message}</small>}
            <button type="submit">Logg inn</button>
          </form>
        </div>
        <div>
          <img src={saunaImg} alt="En badstue ved sjøen" />
        </div>
      </article>
    </main>
  );
}

// Protect against timing attacks
// https://github.com/jshttp/basic-auth/issues/39#issuecomment-787635167
function safeCompare(a: string, b: string) {
  const key = crypto.randomBytes(32);
  const ha = crypto.createHmac("sha256", key).update(a).digest();
  const hb = crypto.createHmac("sha256", key).update(b).digest();
  return crypto.timingSafeEqual(ha, hb) && a === b;
}
