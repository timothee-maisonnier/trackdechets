import { prisma } from "../../generated/prisma-client";
import { randomNumber } from "../../utils";
import { companyMails } from "../mails";
import { getCompanyActiveUsers } from "../queries/companyUsers";
import { sendMail } from "../../common/mails.helper";
import { UserInputError } from "apollo-server-express";

/**
 * This function is used to renew the security code
 * of a company. If the new security code generated is
 * identical to the previous one, we generate a new one
 * @param siret
 */
export default async function renewSecurityCode(siret: string) {
<<<<<<< HEAD
  if (siret.length !== 14) {
    throw new DomainError(
      "Le siret doit faire 14 caractères",
      ErrorCode.BAD_USER_INPUT
    );
=======
  if (siret.length != 14) {
    throw new UserInputError("Le siret doit faire 14 caractères");
>>>>>>> back - replace DomainError with built-in ApolloError
  }

  const company = await prisma.company({ siret });

  if (!company) {
    throw new UserInputError(
      "Aucune entreprise enregistré sur Trackdéchets avec ce siret"
    );
  }

  const currentSecurityCode = company.securityCode;

  let newSecurityCode = null;

  while (!newSecurityCode || newSecurityCode === currentSecurityCode) {
    newSecurityCode = randomNumber(4);
  }

  const updatedCompany = await prisma.updateCompany({
    where: { siret },
    data: {
      securityCode: newSecurityCode
    }
  });

  const users = await getCompanyActiveUsers(siret);
  const recipients = users.map(({ email, name }) => ({ email, name }));

  const mail = companyMails.securityCodeRenewal(recipients, {
    siret: updatedCompany.siret,
    name: updatedCompany.name
  });
  sendMail(mail);

  return updatedCompany;
}
