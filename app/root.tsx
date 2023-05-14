import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import picoCss from "@picocss/pico/css/pico.min.css";

export default function App() {
  return (
    <html lang="no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <link rel="stylesheet" href={picoCss} />
        <style
          dangerouslySetInnerHTML={{
            __html: `        
@media (min-width: 600px) {
  .grid {
      grid-template-columns: repeat(auto-fit,minmax(0%,1fr));
  }
}
        `,
          }}
        />

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
