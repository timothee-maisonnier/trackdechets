import { resetDatabase } from "../../../../../integration-tests/helper";
import { Query } from "../../../../generated/graphql/types";
import prisma from "../../../../prisma";
import {
  formFactory,
  userWithCompanyFactory
} from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";

const FORM_REVISION_REQUESTS = `
  query FormRevisionRequests($siret: String!) {
    formRevisionRequests(siret: $siret) {
      totalCount
      pageInfo {
        hasNextPage
        startCursor
      }
      edges {
        node {
          id
          form {
            id
          }
          status
        }
      }
    }
  }
`;

describe("Mutation.formRevisionRequests", () => {
  afterEach(() => resetDatabase());

  it("should list every revisionRequest from and to company", async () => {
    const { user, company } = await userWithCompanyFactory("ADMIN");
    const { company: otherCompany } = await userWithCompanyFactory("ADMIN");
    const { query } = makeClient(user);

    const bsdd1 = await formFactory({
      ownerId: user.id,
      opt: { emitterCompanySiret: company.siret }
    });
    const bsdd2 = await formFactory({
      ownerId: user.id,
      opt: { recipientCompanySiret: company.siret }
    });

    // 2 unsettled
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd1.id,
        authoringCompanyId: otherCompany.id,
        approvals: { create: { approverSiret: company.siret } },
        comment: ""
      }
    });
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: { create: { approverSiret: otherCompany.siret } },
        comment: ""
      }
    });

    // 2 settled revisionRequests
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: {
          create: {
            approverSiret: otherCompany.siret,
            status: "ACCEPTED"
          }
        },
        comment: ""
      }
    });
    await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd2.id,
        authoringCompanyId: company.id,
        approvals: {
          create: {
            approverSiret: otherCompany.siret,
            status: "REFUSED"
          }
        },
        comment: ""
      }
    });

    const { data } = await query<Pick<Query, "formRevisionRequests">>(
      FORM_REVISION_REQUESTS,
      {
        variables: { siret: company.siret }
      }
    );

    expect(data.formRevisionRequests.totalCount).toBe(4);
    expect(data.formRevisionRequests.pageInfo.hasNextPage).toBe(false);
  });

  it("should fail if requesting a siret current user is not part of", async () => {
    const { user } = await userWithCompanyFactory("ADMIN");
    const { company } = await userWithCompanyFactory("ADMIN");
    const { query } = makeClient(user);

    const { errors } = await query<Pick<Query, "formRevisionRequests">>(
      FORM_REVISION_REQUESTS,
      {
        variables: { siret: company.siret }
      }
    );

    expect(errors[0].message).toBe(
      `Vous n'êtes pas membre de l'entreprise portant le siret "${company.siret}".`
    );
  });
});
