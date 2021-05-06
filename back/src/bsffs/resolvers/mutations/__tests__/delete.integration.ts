import { UserRole } from ".prisma/client";
import { resetDatabase } from "../../../../../integration-tests/helper";
import getReadableId, { ReadableIdPrefix } from "../../../../forms/readableId";
import {
  Mutation,
  MutationDeleteBsffArgs
} from "../../../../generated/graphql/types";
import prisma from "../../../../prisma";
import { userWithCompanyFactory } from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";

const DELETE_BSFF = `
  mutation DeleteBsff($id: ID!) {
    deleteBsff(id: $id) {
      id
    }
  }
`;

describe("Mutation.deleteBsff", () => {
  afterEach(resetDatabase);

  it("should allow user to delete a bsff", async () => {
    const { user, company } = await userWithCompanyFactory(UserRole.ADMIN);
    const { mutate } = makeClient(user);

    const bsff = await prisma.bsff.create({
      data: {
        id: getReadableId(ReadableIdPrefix.FF),
        emitterCompanySiret: company.siret
      }
    });
    const { data, errors } = await mutate<
      Pick<Mutation, "deleteBsff">,
      MutationDeleteBsffArgs
    >(DELETE_BSFF, {
      variables: {
        id: bsff.id
      }
    });

    expect(errors).toBeUndefined();
    expect(data.deleteBsff.id).toBeTruthy();
  });

  it("should disallow unauthenticated user from deleting a bsff", async () => {
    const { mutate } = makeClient();
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsff">,
      MutationDeleteBsffArgs
    >(DELETE_BSFF, {
      variables: {
        id: "123"
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: "UNAUTHENTICATED"
        }
      })
    ]);
  });

  it("should disallow user that is not a contributor on the bsff", async () => {
    const { user } = await userWithCompanyFactory(UserRole.ADMIN);
    const { mutate } = makeClient(user);

    const bsff = await prisma.bsff.create({
      data: {
        id: getReadableId(ReadableIdPrefix.FF)
      }
    });
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsff">,
      MutationDeleteBsffArgs
    >(DELETE_BSFF, {
      variables: {
        id: bsff.id
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message:
          "Vous ne pouvez pas éditer un bordereau sur lequel le SIRET de votre entreprise n'apparaît pas."
      })
    ]);
  });

  it("should throw an error if the bsff being deleted doesn't exist", async () => {
    const { user } = await userWithCompanyFactory(UserRole.ADMIN);
    const { mutate } = makeClient(user);

    const { errors } = await mutate<
      Pick<Mutation, "deleteBsff">,
      MutationDeleteBsffArgs
    >(DELETE_BSFF, {
      variables: {
        id: "123"
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message: "Le bordereau de fluides frigorigènes n°123 n'existe pas."
      })
    ]);
  });

  it("should throw an error if the bsff has already been deleted", async () => {
    const { user, company } = await userWithCompanyFactory(UserRole.ADMIN);
    const { mutate } = makeClient(user);

    const bsff = await prisma.bsff.create({
      data: {
        id: getReadableId(ReadableIdPrefix.FF),
        emitterCompanySiret: company.siret,
        isDeleted: true
      }
    });
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsff">,
      MutationDeleteBsffArgs
    >(DELETE_BSFF, {
      variables: {
        id: bsff.id
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message: `Le bordereau de fluides frigorigènes n°${bsff.id} n'existe pas.`
      })
    ]);
  });

  it.todo("should disallow deleting a bsff with a signature");
});
