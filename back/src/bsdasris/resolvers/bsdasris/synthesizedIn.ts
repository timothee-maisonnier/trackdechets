import { BsdasriResolvers } from "../../../generated/graphql/types";
import prisma from "../../../prisma";

import { unflattenBsdasri } from "../../converter";

const synthesizedIn: BsdasriResolvers["synthesizedIn"] = async bsdasri => {
  const synthesizedIn = await prisma.bsdasri
    .findUnique({ where: { id: bsdasri.id } })
    .synthesizedIn();
  if (!synthesizedIn) {
    return null;
  }
  return unflattenBsdasri(synthesizedIn);
};

export default synthesizedIn;
