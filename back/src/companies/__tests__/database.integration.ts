import prisma from "../../prisma";
import { resetDatabase } from "../../../integration-tests/helper";
import { companyFactory } from "../../__tests__/factories";
import { getCompanyInvitedUsers } from "../database";
import { createUserDataLoaders } from "../../users/dataloaders";
import { AppDataloaders } from "../../types";

const dataloaders = createUserDataLoaders() as AppDataloaders;

describe("getInvitedUsers", () => {
  afterAll(resetDatabase);

  it("should not return a user who has already joined", async () => {
    const company = await companyFactory();
    await prisma.userAccountHash.create({
      data: {
        email: "john.snow@trackdechets.fr",
        companySiret: company.siret,
        hash: "hash1",
        role: "MEMBER",
        acceptedAt: new Date()
      }
    });
    const invitedUsers = await getCompanyInvitedUsers(
      company.siret,
      dataloaders
    );
    expect(invitedUsers).toEqual([]);
  });

  it("should return list of invited users", async () => {
    const company = await companyFactory();
    const invitation = await prisma.userAccountHash.create({
      data: {
        email: "john.snow@trackdechets.fr",
        companySiret: company.siret,
        hash: "hash2",
        role: "MEMBER"
      }
    });
    const invitedUsers = await getCompanyInvitedUsers(
      company.siret,
      dataloaders
    );
    expect(invitedUsers).toHaveLength(1);
    expect(invitedUsers[0]).toMatchObject({
      email: invitation.email,
      isPendingInvitation: true,
      name: "Invité",
      role: invitation.role
    });
  });
});
