import { MutationResolvers } from "../../../generated/graphql/types";
import { checkIsAuthenticated } from "../../../common/permissions";
import transitionForm from "../../workflow/transitionForm";
import { getFormOrFormNotFound } from "../../database";
import { checkCanMarkAsTempStorerAccepted } from "../../permissions";
import { tempStorerAcceptedInfoSchema } from "../../validation";
import { EventType } from "../../workflow/types";
import { expandFormFromDb } from "../../form-converter";
import { WasteAcceptationStatus } from "@prisma/client";
import { getFormRepository } from "../../repository";

const markAsTempStorerAcceptedResolver: MutationResolvers["markAsTempStorerAccepted"] =
  async (_, args, context) => {
    const user = checkIsAuthenticated(context);
    const formRepository = getFormRepository(user);
    const { id, tempStorerAcceptedInfo } = args;
    const form = await getFormOrFormNotFound({ id });

    await checkCanMarkAsTempStorerAccepted(user, form);

    const tempStorageUpdateInput = {
      tempStorerQuantityType: tempStorerAcceptedInfo.quantityType,
      tempStorerQuantityReceived: tempStorerAcceptedInfo.quantityReceived,
      tempStorerWasteAcceptationStatus:
        tempStorerAcceptedInfo.wasteAcceptationStatus,
      tempStorerWasteRefusalReason: tempStorerAcceptedInfo.wasteRefusalReason,
      tempStorerSignedAt: tempStorerAcceptedInfo.signedAt,
      tempStorerSignedBy: tempStorerAcceptedInfo.signedBy
    };

    await tempStorerAcceptedInfoSchema.validate(tempStorageUpdateInput);

    const formUpdateInput = {
      temporaryStorageDetail: {
        update: {
          ...tempStorageUpdateInput,
          tempStorerSignedAt: new Date(
            tempStorageUpdateInput.tempStorerSignedAt
          )
        }
      }
    };

    const tempStoredForm = await transitionForm(user, form, {
      type: EventType.MarkAsTempStorerAccepted,
      formUpdateInput
    });

    if (
      tempStorerAcceptedInfo.wasteAcceptationStatus ===
      WasteAcceptationStatus.REFUSED
    ) {
      await formRepository.removeAppendix2(id);
    }

    return expandFormFromDb(tempStoredForm);
  };

export default markAsTempStorerAcceptedResolver;
