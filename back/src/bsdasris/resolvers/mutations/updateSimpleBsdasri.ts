import { expandBsdasriFromDB, flattenBsdasriInput } from "../../converter";
import { BsdasriStatus, BsdasriType, Bsdasri } from "@prisma/client";
import prisma from "../../../prisma";
import { BsdasriInput } from "../../../generated/graphql/types";

import { validateBsdasri } from "../../validation";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { indexBsdasri } from "../../elastic";
import { getFieldsAllorwedForUpdate } from "./fieldsUpdateRules";
import { emitterIsAllowedToGroup, checkDasrisAreGroupable } from "./utils";

const getGroupedBsdasriArgs = (
  inputRegroupedBsdasris: string[] | null | undefined
) => {
  if (inputRegroupedBsdasris === null) {
    return { grouping: { set: [] } };
  }

  const args = !!inputRegroupedBsdasris
    ? {
        set: inputRegroupedBsdasris.map(id => ({
          id
        }))
      }
    : {};
  return { grouping: args };
};

/**
 * Bsdasri update helper
 * handle SIMPLE and GROUPING dasris
 */
const updateBsdasri = async ({
  id,
  input,
  dbBsdasri,
  dbGrouping
}: {
  id: string;
  dbBsdasri: Bsdasri;
  input: BsdasriInput;
  dbGrouping: any;
}) => {
  const { grouping: inputGrouping, synthesizing: inputSynthesizing } = input;
  const isGroupingType = dbBsdasri.type === BsdasriType.GROUPING;
  const flattenedInput = flattenBsdasriInput(input);

  if (inputGrouping?.length > 0 && !isGroupingType) {
    throw new UserInputError(
      "Le champ grouping n'est accessible que sur les dasri de groupement."
    );
  }

  if (inputSynthesizing?.length > 0) {
    throw new UserInputError(
      "Le champ synthesizing n'est accessible que sur les dasri de synthèse."
    );
  }

  if (inputGrouping !== undefined) {
    if (dbBsdasri.status !== BsdasriStatus.INITIAL) {
      throw new UserInputError(
        "Les bordereaux associés à ce bsd ne sont plus modifiables"
      );
    }

    if (!inputGrouping?.length) {
      throw new UserInputError(
        "Un bordereau de groupement doit avoir des bordereaux associés."
      );
    }

    await emitterIsAllowedToGroup(
      flattenedInput?.emitterCompanySiret ?? dbBsdasri?.emitterCompanySiret
    );
    const newDasrisToGroup = inputGrouping.filter(
      el => !dbGrouping.map(el => el.id).includes(el)
    );
    await checkDasrisAreGroupable(
      newDasrisToGroup,
      flattenedInput?.emitterCompanySiret ?? dbBsdasri?.emitterCompanySiret
    );
  }

  const expectedBsdasri = { ...dbBsdasri, ...flattenedInput };

  // Validate form input

  await validateBsdasri(expectedBsdasri, {
    isGrouping: isGroupingType
  });

  const flattenedFields = Object.keys(flattenedInput);

  // except for draft and sealed status, update fields are whitelisted
  if (dbBsdasri.status !== "INITIAL") {
    const allowedFields = getFieldsAllorwedForUpdate(dbBsdasri);

    const diff = flattenedFields.filter(el => !allowedFields.includes(el));

    if (!!diff.length) {
      const errMessage = `Des champs ont été verrouillés via signature et ne peuvent plus être modifiés: ${diff.join()}`;
      throw new ForbiddenError(errMessage);
    }
  }

  const updatedDasri = await prisma.bsdasri.update({
    where: { id },
    data: {
      ...flattenedInput,
      ...getGroupedBsdasriArgs(inputGrouping)
    }
  });

  const expandedDasri = expandBsdasriFromDB(updatedDasri);
  await indexBsdasri(updatedDasri);
  return expandedDasri;
};

export default updateBsdasri;
