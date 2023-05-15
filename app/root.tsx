import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import picoCss from "@picocss/pico/css/pico.min.css";

import style from "./style.css";

export default function App() {
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
              <a href="/" className="contrast">
                <strong>Badstuknappen</strong>
              </a>
            </li>
          </ul>
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
