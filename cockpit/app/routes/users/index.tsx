import { db } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { User } from "@prisma/client";

import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "@gouvfr/dsfr/dist/dsfr/dsfr.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = { users: Array<User> };

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    users: await db.User.findMany({ take: 50 })
  };
  return json(data);
};

export default function RoutesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
    
      <div className="fr-col">
        <div className="col-demo">
          {" "}
          <table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
          <tbody>
            {data.users.map(user => (
              <tr key={user.id}>
                <td>  <a href={`/users/${user.id}`}>{user.name}</a></td>
                <td>  {user.email}</td>
              </tr>
            ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
