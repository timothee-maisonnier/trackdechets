import { Bsdasri, BsdasriStatus } from "@prisma/client";

import { BsdasriSirets } from "./types";

import { NotFormContributor } from "../forms/errors";

import { UserInputError, ForbiddenError } from "apollo-server-express";
export class InvalidPublicationAttempt extends UserInputError {
  constructor(reason?: string) {
    super(`Vous ne pouvez pas publier ce bordereau.${reason ?? ""}`);
  }
}

function isDasriEmitter(userCompaniesSirets: string[], dasri: BsdasriSirets) {
  if (!dasri.emitterCompanySiret) {
    return false;
  }

  return userCompaniesSirets.includes(dasri.emitterCompanySiret);
}

function isDasriRecipient(userCompaniesSirets: string[], dasri: BsdasriSirets) {
  if (!dasri.destinationCompanySiret) {
    return false;
  }

  return userCompaniesSirets.includes(dasri.destinationCompanySiret);
}

function isDasriTransporter(
  userCompaniesSirets: string[],
  dasri: BsdasriSirets
) {
  if (!dasri.transporterCompanySiret) {
    return false;
  }

  return userCompaniesSirets.includes(dasri.transporterCompanySiret);
}

export async function checkIsBsdasriContributor(
  userSirets: string[],
  dasri: BsdasriSirets,
  errorMsg: string
) {
  console.log("--", userSirets, dasri);
  const isContributor = [
    isDasriEmitter,
    isDasriTransporter,
    isDasriRecipient
  ].some(isFormRole => isFormRole(userSirets, dasri));

  if (!isContributor) {
    throw new NotFormContributor(errorMsg);
  }

  return true;
}
export async function checkIsBsdasriPublishable(
  dasri: Bsdasri,
  grouping?: string[]
) {
  if (!dasri.isDraft || dasri.status !== BsdasriStatus.INITIAL) {
    throw new InvalidPublicationAttempt();
  }
  // This case shouldn't happen, but let's enforce the rules
  if (dasri.type === "GROUPING" && !grouping?.length) {
    throw new InvalidPublicationAttempt(
      "Un bordereau de regroupement doit comporter des bordereaux regroupés"
    );
  }

  return true;
}
export async function checkCanReadBsdasri(
  userSirets: string[],
  bsdasri: Bsdasri
) {
  return checkIsBsdasriContributor(
    userSirets,
    bsdasri,
    "Vous n'êtes pas autorisé à accéder à ce bordereau"
  );
}

export function checkCanEditBsdasri(bsdasri: Bsdasri) {
  if (!!bsdasri.synthesizedInId)
    throw new ForbiddenError(
      "Ce bordereau est regroupé dans un bordereau de synthèse, il n'est pas modifiable, aucune signature ne peut y être apposée "
    );
  return true;
}

export async function checkCanDeleteBsdasri(
  userSirets: string[],
  bsdasri: Bsdasri
) {
  await checkIsBsdasriContributor(
    userSirets,
    bsdasri,
    "Vous n'êtes pas autorisé à supprimer ce bordereau."
  );

  if (bsdasri.status !== BsdasriStatus.INITIAL) {
    throw new ForbiddenError(
      "Seuls les bordereaux en brouillon ou en attente de collecte peuvent être supprimés"
    );
  }

  return true;
}
