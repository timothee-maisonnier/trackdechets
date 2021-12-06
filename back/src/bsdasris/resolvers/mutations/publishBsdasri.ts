import { checkIsAuthenticated } from "../../../common/permissions";
import { MutationResolvers } from "../../../generated/graphql/types";
import { getBsdasriOrNotFound } from "../../database";
import { unflattenBsdasri } from "../../converter";
import { validateBsdasri } from "../../validation";
import {
  checkIsBsdasriContributor,
  checkIsBsdasriPublishable,
  checkCanEditBsdasri
} from "../../permissions";
import prisma from "../../../prisma";
import { indexBsdasri } from "../../elastic";
import { getUserSirets } from "../../../users/database";

const publishBsdasriResolver: MutationResolvers["publishBsdasri"] = async (
  _,
  { id },
  context
) => {
  const user = checkIsAuthenticated(context);
  const userSirets = await getUserSirets(user.id);

  const { grouping, synthesizing, ...bsdasri } = await getBsdasriOrNotFound({
    id,
    includeGrouped: true
  });

  checkCanEditBsdasri(bsdasri);

  await checkIsBsdasriContributor(
    userSirets,
    bsdasri,
    "Vous ne pouvez publier ce bordereau si vous ne figurez pas dessus"
  );
  await checkIsBsdasriPublishable(
    bsdasri,
    grouping.map(el => el.id)
  );

  await validateBsdasri(bsdasri, { emissionSignature: true });

  // publish  dasri
  const publishedBsdasri = await prisma.bsdasri.update({
    where: { id: bsdasri.id },
    data: { isDraft: false }
  });

  const expandedDasri = unflattenBsdasri(publishedBsdasri);
  await indexBsdasri(publishedBsdasri);
  return expandedDasri;
};

export default publishBsdasriResolver;
