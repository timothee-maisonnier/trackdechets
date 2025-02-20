import CompanySelector from "form/common/components/company/CompanySelector";
import DateInput from "form/common/components/custom-inputs/DateInput";
import { Field, useFormikContext } from "formik";

import {
  BsdasriStatus,
  Bsdasri,
  BsdasriType,
  Query,
  QueryCompanyInfosArgs,
} from "generated/graphql/types";
import React from "react";
import initialState from "../utils/initial-state";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { FillFieldsInfo, DisabledFieldsInfo } from "../utils/commons";
import classNames from "classnames";
import Transport from "./Transport";
import { Loader } from "common/components";
import companyStyles from "form/common/components/company/CompanyResult.module.scss";
import RedErrorMessage from "common/components/RedErrorMessage";

/**
 *
 * Tweaked Transporter component where takeover fields can be displayed on demand
 * This is useful to edit these fields for direct takeover, as they're usually hidden as long as the dasri is not SIGNED_BY_TRANPORTER
 */
export function TransporterShowingTakeOverFields({ status, stepName }) {
  return (
    <Transporter
      status={status}
      displayTakeoverFields={true}
      stepName={stepName}
    />
  );
}

export default function Transporter({
  status,
  displayTakeoverFields = false,

  stepName,
}) {
  const { setFieldValue, values } = useFormikContext<Bsdasri>();
  const isSynthesizing = values.type === BsdasriType.Synthesis;

  // handedOverAt is editable even after dasri reception
  const showHandedOverAtField = [
    BsdasriStatus.Sent,
    BsdasriStatus.Received,
  ].includes(status);

  const disabled = [BsdasriStatus.Sent, BsdasriStatus.Received].includes(
    status
  );

  const transportEmphasis = stepName === "transport";
  return (
    <>
      {transportEmphasis && <FillFieldsInfo />}
      {disabled && <DisabledFieldsInfo />}
      <div
        className={classNames("form__row", {
          "field-emphasis": transportEmphasis,
        })}
      >
        {isSynthesizing ? (
          <CurrentCompanyWidget disabled={disabled} />
        ) : (
          <CompanySelector
            disabled={disabled}
            name="transporter.company"
            heading="Entreprise de transport"
            optionalMail={true}
            allowForeignCompanies={true}
            registeredOnlyCompanies={true}
            onCompanySelected={transporter => {
              if (transporter.transporterReceipt) {
                setFieldValue(
                  "transporter.recepisse.number",
                  transporter.transporterReceipt.receiptNumber
                );
                setFieldValue(
                  "transporter.recepisse.validityLimit",
                  transporter.transporterReceipt.validityLimit
                );
                setFieldValue(
                  "transporter.recepisse.department",
                  transporter.transporterReceipt.department
                );
              } else {
                setFieldValue("transporter.recepisse.number", "");
                setFieldValue(
                  "transporter.recepisse.validityLimit",
                  initialState().transporter.recepisse.validityLimit
                );

                setFieldValue("transporter.recepisse.department", "");
              }
            }}
          />
        )}
      </div>

      {showHandedOverAtField ? (
        <div
          className={classNames("form__row", {
            "field-emphasis": transportEmphasis,
          })}
        >
          <label>
            Date de remise à l'installation destinataire (optionnel)
            <div className="td-date-wrapper">
              <Field
                name="transporter.transport.handedOverAt"
                component={DateInput}
                className="td-input"
              />
            </div>
          </label>
        </div>
      ) : (
        <p className="tw-mt-2">
          La date de remise à l'installation destinataire sera éditable après
          l'emport du déchet
        </p>
      )}
      <Transport status={status} />
    </>
  );
}

const COMPANY_INFOS = gql`
  query CompanyInfos($siret: String!) {
    companyInfos(siret: $siret) {
      siret
      name
      address
      companyTypes
      contactEmail
      contactPhone
      transporterReceipt {
        receiptNumber
        validityLimit
        department
      }
    }
  }
`;

function CurrentCompanyWidget({ disabled = false }) {
  const { values, setFieldValue } = useFormikContext<Bsdasri>();

  const { siret } = useParams<{ siret: string }>();
  const { data, loading, error } = useQuery<
    Pick<Query, "companyInfos">,
    QueryCompanyInfosArgs
  >(COMPANY_INFOS, {
    variables: { siret },
    fetchPolicy: "no-cache",

    onCompleted: () => {
      if (!values?.transporter?.company?.mail) {
        setFieldValue(
          `transporter.company.mail`,
          data?.companyInfos?.contactEmail
        );
      }

      if (!values?.transporter?.company?.phone) {
        setFieldValue(
          `transporter.company.phone`,
          data?.companyInfos?.contactPhone
        );
      }
      if (data?.companyInfos?.transporterReceipt) {
        setFieldValue(
          "transporter.recepisse.number",
          data?.companyInfos?.transporterReceipt.receiptNumber
        );
        setFieldValue(
          "transporter.recepisse.validityLimit",
          data?.companyInfos?.transporterReceipt.validityLimit
        );
        setFieldValue(
          "transporter.recepisse.department",
          data?.companyInfos?.transporterReceipt.department
        );
      } else {
        setFieldValue("transporter.recepisse.number", "");
        setFieldValue(
          "transporter.recepisse.validityLimit",
          initialState().transporter.recepisse.validityLimit
        );

        setFieldValue("transporter.recepisse.department", "");
      }
    },
  });
  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <div>error</div>;
  }

  if (!data) {
    return <div>error</div>;
  }

  if (data) {
    return (
      <div>
        <h4 className="form__section-heading">Entreprise de transport</h4>
        <div
          className={`${companyStyles.resultsItem}  ${companyStyles.isSelected}`}
        >
          <div className={companyStyles.content}>
            <h6>{data?.companyInfos?.name}</h6>
            <p>
              {data?.companyInfos?.siret} - {data?.companyInfos?.address}
            </p>
          </div>
        </div>
        <div>
          <label>
            Personne à contacter
            <Field
              type="text"
              name={`transporter.company.contact`}
              placeholder="NOM Prénom"
              className="td-input"
              disabled={disabled}
            />
          </label>
          <RedErrorMessage name={`transporter.company.contact.contact`} />
        </div>

        <div className="form__row">
          <label>
            Téléphone ou Fax
            <Field
              type="text"
              name={`transporter.company.phone`}
              placeholder="Numéro"
              className={`td-input`}
              disabled={disabled}
            />
          </label>

          <RedErrorMessage name={`transporter.company.phone`} />
        </div>
        <div className="form__row">
          <label>
            Mail (optionnel)
            <Field
              type="email"
              name={`transporter.company.mail`}
              className="td-input"
              disabled={disabled}
            />
          </label>

          <RedErrorMessage name={`transporter.company.mail`} />
        </div>
      </div>
    );
  }
  return null;
}
