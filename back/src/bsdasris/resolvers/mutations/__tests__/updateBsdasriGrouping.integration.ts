import { resetDatabase } from "../../../../../integration-tests/helper";
import { bsdasriFactory } from "../../../__tests__/factories";
import { userWithCompanyFactory } from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";
import { BsdasriStatus } from "@prisma/client";
import { ErrorCode } from "../../../../common/errors";
import { Mutation } from "../../../../generated/graphql/types";

const UPDATE_DASRI = `
mutation UpdateDasri($id: ID!, $input: BsdasriInput!) {
  updateBsdasri(id: $id, input: $input) {
    id
    status
    type
    emitter {
       company {
          mail
        }
      }
      grouping { id }
  }
}`;
describe("Mutation.updateBsdasri", () => {
  afterEach(resetDatabase);

  it("should forbid grouping field to simple dasris", async () => {
    const { user, company } = await userWithCompanyFactory("MEMBER", {
      companyTypes: {
        set: ["COLLECTOR"]
      }
    });
    const toRegroup = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.PROCESSED,
        emitterCompanySiret: "1234",
        destinationCompanySiret: company.siret,
        destinationOperationCode: "R1"
      }
    });
    // simple dasri
    const dasri = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.INITIAL,
        emitterCompanySiret: company.siret
      }
    });

    const { mutate } = makeClient(user);

    // try to pass grouping infos
    const { errors } = await mutate<Pick<Mutation, "updateBsdasri">>(
      UPDATE_DASRI,
      {
        variables: {
          id: dasri.id,
          input: { grouping: [toRegroup.id] }
        }
      }
    );

    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Le champ grouping n'est accessible que sur les dasri de groupement.",
        extensions: expect.objectContaining({
          code: ErrorCode.BAD_USER_INPUT
        })
      })
    ]);
  });

  it("should forbid null grouping input on a grouping bsdasri", async () => {
    const { user, company } = await userWithCompanyFactory("MEMBER", {
      companyTypes: {
        set: ["COLLECTOR"]
      }
    });

    // grouping bsdasri
    const dasri = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.INITIAL,
        emitterCompanySiret: company.siret,
        type: "GROUPING"
      }
    });

    const { mutate } = makeClient(user);

    // try to pass empty grouping input
    const { errors } = await mutate<Pick<Mutation, "updateBsdasri">>(
      UPDATE_DASRI,
      {
        variables: {
          id: dasri.id,
          input: { grouping: null }
        }
      }
    );

    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Un bordereau de groupement doit avoir des bordereaux associés.",
        extensions: expect.objectContaining({
          code: ErrorCode.BAD_USER_INPUT
        })
      })
    ]);
  });

  it("should forbid empty grouping input on a grouping bsdasri", async () => {
    const { user, company } = await userWithCompanyFactory("MEMBER", {
      companyTypes: {
        set: ["COLLECTOR"]
      }
    });

    // grouping bsdasri
    const dasri = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.INITIAL,
        emitterCompanySiret: company.siret,
        type: "GROUPING"
      }
    });

    const { mutate } = makeClient(user);

    // try to pass empty grouping input
    const { errors } = await mutate<Pick<Mutation, "updateBsdasri">>(
      UPDATE_DASRI,
      {
        variables: {
          id: dasri.id,
          input: { grouping: [] }
        }
      }
    );

    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Un bordereau de groupement doit avoir des bordereaux associés.",
        extensions: expect.objectContaining({
          code: ErrorCode.BAD_USER_INPUT
        })
      })
    ]);
  });

  it("should allow grouping input update on a grouping bsdasri", async () => {
    const { user, company } = await userWithCompanyFactory("MEMBER", {
      companyTypes: {
        set: ["COLLECTOR"]
      }
    });

    const regrouped = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.PROCESSED,
        emitterCompanySiret: "1234",
        destinationCompanySiret: company.siret,
        destinationOperationCode: "R12"
      }
    });
    // grouping bsdasri
    const dasri = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.INITIAL,
        emitterCompanySiret: company.siret,
        type: "GROUPING",
        grouping: { connect: [{ id: regrouped.id }] }
      }
    });
    const toRegroup = await bsdasriFactory({
      opt: {
        status: BsdasriStatus.PROCESSED,
        emitterCompanySiret: "1234",
        destinationCompanySiret: company.siret,
        destinationOperationCode: "R12"
      }
    });
    const { mutate } = makeClient(user);

    const { data } = await mutate<Pick<Mutation, "updateBsdasri">>(
      UPDATE_DASRI,
      {
        variables: {
          id: dasri.id,
          input: { grouping: [toRegroup.id] }
        }
      }
    );

    expect(data.updateBsdasri.grouping.map(bsd => bsd.id)).toEqual([
      toRegroup.id
    ]);
  });
});
