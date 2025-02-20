/**
 * PRISMA HELPER FUNCTIONS
 */

import prisma from "../prisma";

import { User, UserRole, Prisma, Company } from "@prisma/client";

import { FullUser } from "./types";
import { UserInputError } from "apollo-server-express";
import { hash } from "bcrypt";
import { getUid, sanitizeEmail, hashToken } from "../utils";
import { deleteCachedUserCompanies } from "../common/redis/users";

export async function getUserCompanies(userId: string): Promise<Company[]> {
  // hint: See getCachedUserSirets function to leverage redis
  const companyAssociations = await prisma.companyAssociation.findMany({
    where: { userId },
    include: { company: true }
  });
  return companyAssociations.map(association => association.company);
}

/**
 * Returns a user with linked objects
 * @param user
 */
export async function getFullUser(user: User): Promise<FullUser> {
  const companies = await getUserCompanies(user.id);
  return {
    ...user,
    companies
  };
}

/**
 * Create a temporary association between an email and
 * a siret
 * @param email
 * @param role
 * @param siret
 */
export async function createUserAccountHash(
  email: string,
  role: UserRole,
  siret: string
) {
  // check for existing records
  const existingHashes = await prisma.userAccountHash.findMany({
    where: { email, companySiret: siret }
  });

  if (existingHashes && existingHashes.length > 0) {
    throw new UserInputError("Cet utilisateur a déjà été invité", {
      invalidArgs: ["email"]
    });
  }

  const userAccoutHash = await hash(
    new Date().valueOf().toString() + Math.random().toString(),
    10
  );

  return prisma.userAccountHash.create({
    data: {
      hash: userAccoutHash,
      email,
      role,
      companySiret: siret
    }
  });
}

/**
 * Associate an existing user with company
 * Make sure we do not create a double association
 * @param userId
 * @param siret
 * @param role
 */
export async function associateUserToCompany(userId, siret, role) {
  // check for current associations
  const associations = await prisma.companyAssociation.findMany({
    where: {
      user: {
        id: userId
      },
      company: {
        siret
      }
    }
  });

  if (associations && associations.length > 0) {
    throw new UserInputError(
      "L'utilisateur est déjà membre de l'établissement"
    );
  }

  const association = await prisma.companyAssociation.create({
    data: {
      user: { connect: { id: userId } },
      role,
      company: { connect: { siret } }
    }
  });

  // fill firstAssociationDate field if null (no need to update it if user was previously already associated)
  await prisma.user.updateMany({
    where: { id: userId, firstAssociationDate: null },
    data: { firstAssociationDate: new Date() }
  });

  // clear cache
  await deleteCachedUserCompanies(userId);

  return association;
}

export async function getUserAccountHashOrNotFound(
  where: Prisma.UserAccountHashWhereInput
) {
  const userAccountHashes = await prisma.userAccountHash.findMany({
    where
  });
  if (userAccountHashes.length === 0) {
    throw new UserInputError("Cette invitation n'existe pas");
  }
  return userAccountHashes[0];
}

export async function getCompanyAssociationOrNotFound(
  where: Prisma.CompanyAssociationWhereInput
) {
  const companyAssociations = await prisma.companyAssociation.findMany({
    where
  });
  if (companyAssociations.length === 0) {
    throw new UserInputError(`L'utilisateur n'est pas membre de l'entreprise`);
  }
  return companyAssociations[0];
}

type CreateAccessTokenArgs = { user: User; description?: string };

export async function createAccessToken({
  user,
  description
}: CreateAccessTokenArgs) {
  const clearToken = getUid(40);

  const accessToken = await prisma.accessToken.create({
    data: {
      user: {
        connect: { id: user.id }
      },
      ...(description ? { description } : {}),
      token: hashToken(clearToken)
    }
  });
  return { ...accessToken, token: clearToken };
}

export async function userExists(unsafeEmail: string) {
  const count = await prisma.user.count({
    where: {
      email: sanitizeEmail(unsafeEmail)
    }
  });
  return count >= 1;
}

/**
 * Validate a user's pending invitations
 * @param user
 */
export async function acceptNewUserCompanyInvitations(user: User) {
  const existingHashes = await prisma.userAccountHash.findMany({
    where: { email: user.email }
  });

  if (!existingHashes.length) {
    return Promise.resolve();
  }

  await Promise.all(
    existingHashes.map(existingHash =>
      prisma.companyAssociation.create({
        data: {
          company: { connect: { siret: existingHash.companySiret } },
          user: { connect: { id: user.id } },
          role: existingHash.role
        }
      })
    )
  );
  if (!user.firstAssociationDate) {
    await prisma.user.update({
      where: { id: user.id },
      data: { firstAssociationDate: new Date() }
    });
  }

  // clear cache
  await deleteCachedUserCompanies(user.id);

  return prisma.userAccountHash.updateMany({
    where: {
      id: { in: existingHashes.map(h => h.id) }
    },
    data: { acceptedAt: new Date() }
  });
}

export async function getMembershipRequestOrNotFoundError(
  where: Prisma.MembershipRequestWhereUniqueInput
) {
  const membershipRequest = await prisma.membershipRequest.findUnique({
    where
  });
  if (!membershipRequest) {
    throw new UserInputError("Cette demande de rattachement n'existe pas");
  }
  return membershipRequest;
}
