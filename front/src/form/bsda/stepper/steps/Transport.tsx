import React from "react";
import { Field, useFormikContext } from "formik";
import { Bsda } from "generated/graphql/types";
import { RedErrorMessage, FieldTransportModeSelect } from "common/components";
import Tooltip from "common/components/Tooltip";
import TagsInput from "common/components/tags-input/TagsInput";
import DateInput from "form/common/components/custom-inputs/DateInput";

type Props = { disabled: boolean };
export function Transport({ disabled }: Props) {
  const { values } = useFormikContext<Bsda>();

  return (
    <>
      {values.transporter?.company?.siret === null ? (
        <label>
          Numéro de TVA intracommunautaire
          <Field
            type="text"
            name="transporter.company.vatNumber"
            placeholder="Ex: DE 123456789"
            className="td-input"
            disabled={disabled}
          />
        </label>
      ) : (
        <>
          <h4 className="form__section-heading">
            Récépissé de déclaration de transport de déchets
          </h4>
          <div className="form__row">
            <label>
              Numéro de récépissé
              <Field
                type="text"
                name="transporter.recepisse.number"
                className="td-input td-input--medium"
                disabled={disabled}
              />
            </label>

            <RedErrorMessage name="transporter.recepisse.number" />

            <label>
              Département
              <Field
                type="text"
                name="transporter.recepisse.department"
                placeholder="Ex: 83"
                className={`td-input td-input--small`}
                disabled={disabled}
              />
            </label>

            <RedErrorMessage name="transporter.recepisse.department" />

            <label>
              Limite de validité
              <Field
                component={DateInput}
                name="transporter.recepisse.validityLimit"
                className={`td-input td-input--small`}
                disabled={disabled}
              />
            </label>

            <RedErrorMessage name="transporter.recepisse.validityLimit" />
          </div>
        </>
      )}

      <h4 className="form__section-heading">Détails</h4>
      <div className="form__row">
        <label>
          Mode de transport:
          <Field
            id="id_mode"
            name="transporter.transport.mode"
            component={FieldTransportModeSelect}
            disabled={disabled}
          ></Field>
        </label>
      </div>

      <div className="form__row">
        <label>
          Immatriculations
          <Tooltip msg="Saisissez les numéros un par un. Appuyez sur la touche <Entrée> ou <Tab> pour valider chacun" />
          <TagsInput
            name="transporter.transport.plates"
            disabled={disabled}
            limit={2}
          />
        </label>
      </div>

      <div className="form__row">
        <label>
          Date de prise en charge
          <Field
            component={DateInput}
            name="transporter.transport.takenOverAt"
            className={`td-input td-input--small`}
            disabled={disabled}
          />
        </label>
      </div>
    </>
  );
}
