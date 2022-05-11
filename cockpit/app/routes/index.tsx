import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "@gouvfr/dsfr/dist/dsfr/dsfr.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function Index() {
  return <div>test</div>;
}
