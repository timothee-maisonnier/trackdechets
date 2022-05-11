import type { MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "@gouvfr/dsfr/dist/dsfr/dsfr.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Cockpit - Trackdéchets",
  viewport: "width=device-width,initial-scale=1"
});

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};
export default function App() {
  return (
    <html lang="fr">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="fr-mb-6v">
          <div className="fr-container">
            <h1>Cockpit</h1>
            <Outlet />
            <LiveReload />
          </div>
        </div>
      </body>
    </html>
  );
}
