import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useSearchParams,
} from "@remix-run/react";
import picoCss from "@picocss/pico/css/pico.min.css";

import style from "./style.css";
import { OrderActions } from "./routes/order/order-actions";

export default function App() {
  const [searchParams] = useSearchParams();
  const password = searchParams.get("password");
  const homeLink = password ? `/?password=${password}` : "/";

  const isUseMock = searchParams.get("useMock") === "on";
  return (
    <html lang="no" data-theme="dark">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <link rel="stylesheet" href={picoCss} />
        <link rel="stylesheet" href={style} />

        <Meta />
        <Links />
      </head>
      <body>
        <nav className="container-fluid">
          <ul>
            <li>
              <a href={homeLink} className="contrast">
                {isUseMock ? (
                  <strong>🧪 Badstuknappen 🧪</strong>
                ) : (
                  <strong>Badstuknappen</strong>
                )}
              </a>
            </li>
          </ul>
          <OrderActions />
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
