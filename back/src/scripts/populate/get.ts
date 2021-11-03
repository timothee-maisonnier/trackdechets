import prisma from "../../prisma";
import { getUserCompanies } from "../../users/database";
(async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  });
  for (const user of users) {
    const companies = await getUserCompanies(user.id);
    console.log(user.email, companies[0].siret);
  }
})();
