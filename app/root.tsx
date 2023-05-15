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
import { OrderActions } from "./routes/order/route";

export default function App() {
  const [searchParams] = useSearchParams();
  const password = searchParams.get("password");
  const homeLink = password ? `/?password=${password}` : "/";

  const isUseMock = searchParams.get("useMock") === "on";
  return (
    <html lang="no" data-theme="dark">
      <head>
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
