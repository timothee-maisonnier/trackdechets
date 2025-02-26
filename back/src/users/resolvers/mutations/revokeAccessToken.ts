import { MutationResolvers } from "../../../generated/graphql/types";
import { applyAuthStrategies, AuthType } from "../../../auth";
import { checkIsAuthenticated } from "../../../common/permissions";
import prisma from "../../../prisma";
import { ForbiddenError, UserInputError } from "apollo-server-core";

const revokeAccessTokenResolver: MutationResolvers["revokeAccessToken"] =
  async (_parent, { id }, context) => {
    applyAuthStrategies(context, [AuthType.Session]);
    const user = checkIsAuthenticated(context);
    const accessToken = await prisma.accessToken.findUnique({ where: { id } });
    if (!accessToken) {
      throw new UserInputError("Ce jeton d'accès n'existe pas");
    }
    if (accessToken.userId !== user.id) {
      throw new ForbiddenError(
        "Vous n'avez pas le droit de supprimer ce jeton d'accès"
      );
    }
    return prisma.accessToken.update({
      where: { id },
      data: { isRevoked: true }
    });
  };

export default revokeAccessTokenResolver;
