import { db } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Company } from "@prisma/client";

import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "@gouvfr/dsfr/dist/dsfr/dsfr.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = { company: Company };

export const loader: LoaderFunction = async ({ params }) => {
  const company = await db.Company.findUnique({
    where: { id: params.companyId },
    include: { companyAssociations: { include: { user: true } } }
  });

  if (!company) throw new Error("Company not found");
  const data: LoaderData = { company };
  return json(data);
};

export default function RoutesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12">
        <div className="fr-col">
          <div className="col-demo">
            <p>{data.company.name}</p>
            {data.company.companyAssociations.map(asso => (
              <p>
                {asso.role} {asso.user.email} {asso.user.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
