import React from "react";
import { Field, useFormikContext } from "formik";
import CompanySelector from "form/common/components/company/CompanySelector";
import { Bsda, BsdaType, BsdaPickupSite } from "generated/graphql/types";
import WorkSite from "form/common/components/work-site/WorkSite";

export function Emitter({ disabled }) {
  const { values, handleChange, setFieldValue } = useFormikContext<Bsda>();

  const isValidBsdaSuite =
    [BsdaType.Gathering, BsdaType.Reshipment].includes(
      values?.type as BsdaType
    ) && values.emitter?.company?.siret;

  return (
    <>
      {disabled && (
        <div className="notification notification--error">
          Les champs grisés ci-dessous ont été scellés via signature et ne sont
          plus modifiables.
        </div>
      )}

      {isValidBsdaSuite ? (
        <div className="notification">
          Vous effectuez un groupement ou une réexpédition. L'entreprise
          émettrice est obligatoirement la vôtre:{" "}
          {values.emitter?.company?.name} - {values.emitter?.company?.siret}
        </div>
      ) : (
        <div className="form__row">
          <label>
            <Field
              disabled={disabled}
              type="checkbox"
              name="emitter.isPrivateIndividual"
              className="td-checkbox"
              onChange={e => {
                handleChange(e);
                setFieldValue("emitter.company.siret", null);
              }}
            />
            Le MO ou le détenteur est un particulier
          </label>
        </div>
      )}

      {values.emitter?.isPrivateIndividual || isValidBsdaSuite ? (
        <>
          <div className="form__row">
            {values.emitter?.isPrivateIndividual ? (
              <label>
                Nom et prénom
                <Field
                  type="text"
                  name="emitter.company.name"
                  className="td-input"
                  disabled={disabled}
                />
              </label>
            ) : (
              <label>
                Personne à contacter
                <Field
                  type="text"
                  name="emitter.company.contact"
                  placeholder="NOM Prénom"
                  className="td-input"
                  disabled={disabled}
                />
              </label>
            )}
          </div>
          <div className="form__row">
            <label>
              Adresse
              <Field
                type="text"
                name="emitter.company.address"
                className="td-input"
                disabled={disabled}
              />
            </label>
          </div>
          <div className="form__row">
            <label>
              Téléphone
              <Field
                type="text"
                name="emitter.company.phone"
                className="td-input td-input--small"
                disabled={disabled}
              />
            </label>
          </div>
          <div className="form__row">
            <label>
              Mail
              <Field
                type="text"
                name="emitter.company.mail"
                className="td-input td-input--medium"
                disabled={disabled}
              />
            </label>
          </div>
        </>
      ) : (
        <CompanySelector
          disabled={disabled}
          name="emitter.company"
          heading="Entreprise émettrice"
        />
      )}

      <WorkSite
        switchLabel="Je souhaite ajouter une adresse de chantier ou de collecte"
        headingTitle="Adresse chantier"
        designation="du chantier ou lieu de collecte"
        getInitialEmitterWorkSiteFn={getInitialEmitterPickupSite}
        disabled={disabled}
        modelKey="pickupSite"
      />
    </>
  );
}

export function getInitialEmitterPickupSite(
  pickupSite?: BsdaPickupSite | null
) {
  return {
    name: pickupSite?.name ?? "",
    address: pickupSite?.address ?? "",
    city: pickupSite?.city ?? "",
    postalCode: pickupSite?.postalCode ?? "",
    infos: pickupSite?.infos ?? "",
  };
}
