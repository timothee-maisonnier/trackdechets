import React from "react";
import { Field, Form, Formik } from "formik";
import { formatISO } from "date-fns";
import NumberInput from "form/custom-inputs/NumberInput";
import DateInput from "form/custom-inputs/DateInput";
import { InlineRadioButton, RadioButton } from "form/custom-inputs/RadioButton";
import {
  WasteAcceptationStatusInput as WasteAcceptationStatus,
  FormStatus,
  Form as TdForm,
  QuantityType,
} from "generated/graphql/types";
import { textConfig } from "./ReceivedInfo";
import { RedErrorMessage } from "common/components";

export type AcceptedInfoValues = {
  signedBy: string;
  signedAt: string;
  quantityReceived: number | null;
  wasteAcceptationStatus: WasteAcceptationStatus;
  wasteRefusalReason: string;
  quantityType?: QuantityType;
};

/**
 * Accepted info form shared between markAsAccepted and markAsTempStorerAccepted
 */
export default function AcceptedInfo({
  form,
  close,
  onSubmit,
}: {
  form: TdForm;
  close: () => void;
  onSubmit: (values: AcceptedInfoValues) => void;
}) {
  return (
    <Formik<AcceptedInfoValues>
      initialValues={{
        signedBy: "",
        signedAt: formatISO(new Date(), { representation: "date" }),
        quantityReceived: null,
        wasteAcceptationStatus: "" as WasteAcceptationStatus,
        wasteRefusalReason: "",
      }}
      onSubmit={onSubmit}
    >
      {({ errors, isSubmitting, setFieldValue, values, handleReset }) => (
        <Form>
          <div className="form__row">
            <div className="form__row">
              <fieldset className="form__radio-group">
                <h4 className="tw-mr-2">Lot accepté: </h4>
                <Field
                  name="wasteAcceptationStatus"
                  id={WasteAcceptationStatus.Accepted}
                  label="Oui"
                  component={InlineRadioButton}
                  onChange={() => {
                    // clear wasteRefusalReason if waste is accepted
                    setFieldValue("wasteRefusalReason", "");
                    setFieldValue(
                      "wasteAcceptationStatus",
                      WasteAcceptationStatus.Accepted
                    );
                  }}
                />
                <Field
                  name="wasteAcceptationStatus"
                  id={WasteAcceptationStatus.Refused}
                  label="Non"
                  component={InlineRadioButton}
                  onChange={() => {
                    setFieldValue("quantityReceived", 0);
                    setFieldValue(
                      "wasteAcceptationStatus",
                      WasteAcceptationStatus.Refused
                    );
                  }}
                />
                <Field
                  name="wasteAcceptationStatus"
                  id={WasteAcceptationStatus.PartiallyRefused}
                  label="Partiellement"
                  component={InlineRadioButton}
                />
              </fieldset>
            </div>
          </div>
          <div className="form__row">
            <label>
              Poids à l'arrivée
              <Field
                component={NumberInput}
                name="quantityReceived"
                placeholder="En tonnes"
                className="td-input"
                disabled={
                  values.wasteAcceptationStatus ===
                  WasteAcceptationStatus.Refused
                }
              />
              <span>
                Poids indicatif émis: {form.stateSummary?.quantity} tonnes
              </span>
            </label>
            <RedErrorMessage name="quantityReceived" />
          </div>
          {form.recipient?.isTempStorage && form.status === FormStatus.Sent && (
            <fieldset className="form__row">
              <legend>Cette quantité est</legend>
              <Field
                name="quantityType"
                id="REAL"
                label="Réelle"
                component={RadioButton}
              />
              <Field
                name="quantityType"
                id="ESTIMATED"
                label="Estimée"
                component={RadioButton}
              />
            </fieldset>
          )}
          {/* Display wasteRefusalReason field if waste is refused or partially refused*/}
          {[
            WasteAcceptationStatus.Refused.toString(),
            WasteAcceptationStatus.PartiallyRefused.toString(),
          ].includes(values.wasteAcceptationStatus) && (
            <div className="form__row">
              <label>
                {textConfig[values.wasteAcceptationStatus].refusalReasonText}
                <Field name="wasteRefusalReason" className="td-input" />
              </label>
              <RedErrorMessage name="wasteRefusalReason" />
            </div>
          )}
          <div className="form__row">
            <label>
              Nom du responsable
              <Field
                type="text"
                name="signedBy"
                placeholder="NOM Prénom"
                className="td-input"
              />
            </label>
            <RedErrorMessage name="signedBy" />
          </div>
          <div className="form__row">
            <label>
              Date d'acceptation
              <Field
                component={DateInput}
                name="signedAt"
                className="td-input"
              />
            </label>
            <RedErrorMessage name="signedAt" />
          </div>
          <p>
            {values.wasteAcceptationStatus &&
              textConfig[values.wasteAcceptationStatus].validationText}
          </p>
          <div className="form__actions">
            <button
              type="button"
              className="btn btn--outline-primary"
              onClick={() => {
                handleReset();
                close();
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              Je valide l'acceptation
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
