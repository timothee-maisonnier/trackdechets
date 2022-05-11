import { db } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { User } from "@prisma/client";

 

type LoaderData = { user: User };

export const loader: LoaderFunction = async ({ params }) => {
  const user = await db.User.findUnique({
    where: { id: params.userId },
    include: { companyAssociations: { include: { company: true } } }
   });

  if (!user) throw new Error("User not found");
  const data: LoaderData = { user };
  return json(data);
};


export default function UserRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p><a href="/users"> Users</a></p>
      <p>{data.user.email}</p>
      {data.user.companyAssociations.map(asso => (
              <p>
                {asso.role} {asso.company.siret} {asso.company.name}
              </p>
            ))}
    </div>
  );
}
