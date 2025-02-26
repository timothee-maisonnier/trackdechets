import { UserRole } from "@prisma/client";
import { resetDatabase } from "../../../../../integration-tests/helper";
import {
  Mutation,
  MutationDeleteBsdaArgs
} from "../../../../generated/graphql/types";
import prisma from "../../../../prisma";
import { userWithCompanyFactory } from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";
import { bsdaFactory } from "../../../__tests__/factories";

const DELETE_BSDA = `
  mutation DeleteBsda($id: ID!) {
    deleteBsda(id: $id) {
      id
    }
  }
`;

describe("Mutation.deleteBsda", () => {
  afterEach(resetDatabase);

  it("should allow user to delete a bsda", async () => {
    const { company, user } = await userWithCompanyFactory(UserRole.ADMIN);
    const bsda = await bsdaFactory({
      opt: {
        emitterCompanySiret: company.siret
      }
    });

    const { mutate } = makeClient(user);
    const { data } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
      variables: {
        id: bsda.id
      }
    });

    expect(data.deleteBsda.id).toBeTruthy();
  });

  it("should disallow unauthenticated user from deleting a bsda", async () => {
    const { mutate } = makeClient();
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
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

  it("should disallow user that is not a contributor on the bsda", async () => {
    const { user } = await userWithCompanyFactory(UserRole.ADMIN);
    const { mutate } = makeClient(user);

    const bsda = await bsdaFactory({ opt: {} });
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
      variables: {
        id: bsda.id
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message: "Vous n'êtes pas autorisé à supprimer ce bordereau."
      })
    ]);
  });

  it("should throw an error if the bsda being deleted doesn't exist", async () => {
    const { user } = await userWithCompanyFactory(UserRole.ADMIN);
    const { mutate } = makeClient(user);

    const { errors } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
      variables: {
        id: "123"
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message: `Le bordereau avec l'identifiant "123" n'existe pas.`
      })
    ]);
  });

  it("should throw an error if the bsda has already been deleted", async () => {
    const { company, user } = await userWithCompanyFactory(UserRole.ADMIN);
    const bsda = await bsdaFactory({
      opt: {
        emitterCompanySiret: company.siret,
        isDeleted: true
      }
    });

    const { mutate } = makeClient(user);
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
      variables: {
        id: bsda.id
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message: `Le bordereau avec l'identifiant "${bsda.id}" n'existe pas.`
      })
    ]);
  });

  it("should disallow deleting a bsda with a signature", async () => {
    const { company, user } = await userWithCompanyFactory(UserRole.ADMIN);
    const bsda = await bsdaFactory({
      opt: {
        emitterCompanySiret: company.siret,
        status: "SIGNED_BY_PRODUCER"
      }
    });

    const { mutate } = makeClient(user);
    const { errors } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
      variables: {
        id: bsda.id
      }
    });

    expect(errors).toEqual([
      expect.objectContaining({
        message: `Seuls les bordereaux en brouillon ou n'ayant pas encore été signés peuvent être supprimés`
      })
    ]);
  });

  it("should remove forwardedIn link to deleted BSDA", async () => {
    const { company, user } = await userWithCompanyFactory(UserRole.ADMIN);
    const forwardedBsda = await bsdaFactory({
      opt: {
        destinationCompanySiret: company.siret
      }
    });
    const forwardingBsda = await bsdaFactory({
      opt: {
        forwarding: { connect: { id: forwardedBsda.id } },
        emitterCompanySiret: company.siret
      }
    });

    const { mutate } = makeClient(user);
    const { data } = await mutate<
      Pick<Mutation, "deleteBsda">,
      MutationDeleteBsdaArgs
    >(DELETE_BSDA, {
      variables: {
        id: forwardingBsda.id
      }
    });

    expect(data.deleteBsda.id).toBeTruthy();

    const updatedForwarded = await prisma.bsda.findUnique({
      where: { id: forwardedBsda.id },
      include: { forwarding: true }
    });
    expect(updatedForwarded.forwarding).toBe(null);
  });
});
