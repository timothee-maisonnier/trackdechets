import { db } from "~/utils/db.server";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Company } from "@prisma/client";

import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "@gouvfr/dsfr/dist/dsfr/dsfr.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = { companies: Array<Company> };

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    companies: await db.Company.findMany({ take: 100 })
  };
  return json(data);
};

export default function RoutesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12">
        <div className="fr-col">
          <div className="col-demo">
            <ul>
              {data.companies.map(company => (
                <li key={company.id}>
                  {" "}
                  <Link to={`/companies/${company.id}`}>
                    {company.siret} {company.name}
                  </Link>{" "}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
