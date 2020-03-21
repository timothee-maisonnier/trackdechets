import { userFactory } from "../../../__tests__/factories";
import { resetDatabase } from "../../../../integration-tests/helper";
import * as mailsHelper from "../../../common/mails.helper";
import { prisma, MutationType } from "../../../generated/prisma-client";
import { warnIfUserCreatesTooManyCompanies } from "../../../subscriptions/companies";
import makeClient from "../../../__tests__/testClient";

// No mails
const sendMailSpy = jest.spyOn(mailsHelper, "sendMail");
sendMailSpy.mockImplementation(() => Promise.resolve());

describe("Create company endpoint", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  test("should create company and userAssociation", async () => {
    const user = await userFactory();

    const siret = "12345678912345";

    const mutation = `
    mutation {
      createCompany(
        companyInput: {
          siret: "${siret}"
          gerepId: "1234"
        }
      ) { id }
    }
  `;

    const { mutate } = makeClient(user);

    const { data } = await mutate(mutation);

    expect(data.createCompany.id).toBeDefined();
    expect(data.createCompany.id).not.toBeNull();

    const newCompanyExists = await prisma.$exists.company({ siret });
    expect(newCompanyExists).toBe(true);

    const newCompanyAssociationExists = await prisma.$exists.companyAssociation(
      { company: { siret }, user: { id: user.id } }
    );
    expect(newCompanyAssociationExists).toBe(true);
  });

  test("should alert when a user creates too many companies", async () => {
    const user = await userFactory();
    const { mutate } = makeClient(user);

    async function createCompany(siret) {
      const mutation = `
        mutation {
          createCompany(
            companyInput: {
              siret: "${siret}"
              gerepId: "1234"
            }
          ) { id }
        }
      `;
      await mutate(mutation);
      const companySubscriptionPayload = {
        mutation: "CREATED" as MutationType,
        node: await prisma.company({ siret }),
        updatedFields: null,
        previousValues: null
      };
      await warnIfUserCreatesTooManyCompanies(companySubscriptionPayload);
    }

    // 1 company
    await createCompany("12345678912345");
    expect(sendMailSpy).not.toBeCalled();

    // 2 companies
    await createCompany("23456789123456");
    expect(sendMailSpy).not.toBeCalled();

    // 3 companies
    await createCompany("34567891234567");
    expect(sendMailSpy).not.toBeCalled();

    // 4 companies
    await createCompany("45678912345678");
    expect(sendMailSpy).not.toBeCalled();

    // 5 companies
    await createCompany("56789123456789");
    expect(sendMailSpy).not.toBeCalled();

    // 6 companies => should warn
    await createCompany("67891234567890");
    expect(sendMailSpy).toBeCalled();
  });
});
