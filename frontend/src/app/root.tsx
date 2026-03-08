import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import { Providers } from "./providers.js";
import "./global.css";

export const links: LinksFunction = () => [];

export default function Root() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Providers>
          <Outlet />
        </Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
