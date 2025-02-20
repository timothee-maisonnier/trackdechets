import { ForbiddenError, UserInputError } from "apollo-server-express";
import prisma from "../../../prisma";
import { checkIsAuthenticated } from "../../../common/permissions";
import { QueryResolvers } from "../../../generated/graphql/types";
import { getFormsRightFilter } from "../../database";
import { getConnection } from "../../../common/pagination";

const PAGINATE_BY = 100;

const formsLifeCycleResolver: QueryResolvers["formsLifeCycle"] = async (
  parent,
  { siret, loggedAfter, loggedBefore, cursorAfter, cursorBefore, formId },
  context
) => {
  const user = checkIsAuthenticated(context);

  const userCompanies = await prisma.companyAssociation
    .findMany({
      where: { user: { id: user.id } },
      include: {
        company: { select: { id: true, siret: true } }
      }
    })
    .then(associations => associations.map(a => a.company));

  // User must be associated with a company
  if (!userCompanies.length) {
    throw new ForbiddenError(
      "Vous n'êtes pas autorisé à consulter le cycle de vie des bordereaux."
    );
  }
  // If user is associated with several companies, siret is mandatory
  if (userCompanies.length > 1 && !siret) {
    throw new UserInputError(
      "Vous devez préciser pour quel siret vous souhaitez consulter",
      {
        invalidArgs: ["siret"]
      }
    );
  }
  // If requested siret does not belong to user, raise an error
  if (!!siret && !userCompanies.map(c => c.siret).includes(siret)) {
    throw new ForbiddenError(
      "Vous n'avez pas le droit d'accéder au siret précisé"
    );
  }
  // Select user company matching siret or get the first
  const selectedCompany =
    userCompanies.find(uc => uc.siret === siret) || userCompanies.shift();

  const formsFilter = getFormsRightFilter(selectedCompany.siret);

  const gqlPaginationArgs = {
    after: cursorAfter,
    before: cursorBefore,
    defaultPaginateBy: PAGINATE_BY
  };

  const where = {
    loggedAt: {
      not: null,
      ...(loggedAfter && { gte: new Date(loggedAfter) }),
      ...(loggedBefore && { lte: new Date(loggedBefore) })
    },
    form: { ...formsFilter, isDeleted: false, id: formId }
  };

  const totalCount = await prisma.statusLog.count({ where });

  const { pageInfo, edges } = await getConnection({
    totalCount,
    findMany: prismaPaginationArgs =>
      prisma.statusLog.findMany({
        where,
        ...prismaPaginationArgs,
        orderBy: { loggedAt: "desc" },
        include: {
          form: { select: { id: true, readableId: true } },
          user: { select: { id: true, email: true } }
        }
      }),
    formatNode: statusLog => statusLog,
    ...gqlPaginationArgs
  });

  return {
    statusLogs: edges.map(({ node }) => node),
    count: totalCount,
    pageInfo
  };
};

export default formsLifeCycleResolver;
