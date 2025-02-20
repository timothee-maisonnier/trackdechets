import { gql, useQuery } from "@apollo/client";
import { RedErrorMessage } from "common/components";
import { InlineError } from "common/components/Error";
import { Field, useField, useFormikContext } from "formik";
import {
  CompanyPrivate,
  CreateFormInput,
  Query,
} from "generated/graphql/types";
import styles from "./CompanySelector.module.scss";
import React, { useCallback, useMemo } from "react";
import { getInitialCompany } from "form/bsdd/utils/initial-state";
import { sortCompaniesByName } from "common/helper";

export const GET_ME = gql`
  {
    me {
      id
      companies {
        id
        name
        givenName
        siret
        contactEmail
        contactPhone
        address
      }
    }
  }
`;

export default function MyCompanySelector({ fieldName, onSelect }) {
  const { setFieldValue } = useFormikContext<CreateFormInput>();
  const [field] = useField({ name: fieldName });

  const onCompanySelect = useCallback(
    (
      company: Pick<
        CompanyPrivate,
        "siret" | "name" | "contactEmail" | "contactPhone" | "address"
      >
    ) => {
      setFieldValue(`${fieldName}.siret`, company.siret ?? "");
      setFieldValue(`${fieldName}.name`, company.name ?? "");
      setFieldValue(`${fieldName}.mail`, company.contactEmail ?? "");
      setFieldValue(`${fieldName}.phone`, company.contactPhone ?? "");
      setFieldValue(`${fieldName}.address`, company.address ?? "");
      if (onSelect) {
        onSelect();
      }
    },
    [fieldName, setFieldValue, onSelect]
  );

  const { loading, error, data } = useQuery<Pick<Query, "me">>(GET_ME, {
    onCompleted: data => {
      // check user is member of selected company or reset emitter company
      const companies = data.me.companies;
      if (!companies.map(c => c.siret).includes(field.value.siret)) {
        if (companies.length === 1) {
          onCompanySelect(companies[0]);
        } else {
          onCompanySelect(getInitialCompany());
        }
      }
    },
  });

  const companies = useMemo(() => {
    return sortCompaniesByName(data?.me.companies ?? []);
  }, [data]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <InlineError apolloError={error} />;
  }

  if (data) {
    return (
      <>
        <select
          className="td-select td-input--medium"
          value={field.value?.siret}
          onChange={e => {
            const selectedCompany = companies.filter(
              c => c.siret === e.target.value
            )?.[0];
            if (selectedCompany) {
              onCompanySelect(selectedCompany);
            } else {
              setFieldValue(fieldName, getInitialCompany());
            }
          }}
        >
          <option value="" label="Sélectionner un de vos établissements" />
          {companies.map(c => {
            const name =
              c.givenName && c.givenName !== "" ? c.givenName : c.name;

            return (
              <option
                key={c.siret}
                value={c.siret}
                label={`${name} - ${c.siret}`}
              ></option>
            );
          })}
        </select>
        <div className="form__row">
          <label>
            Personne à contacter
            <Field
              type="text"
              name={`${fieldName}.contact`}
              placeholder="NOM Prénom"
              className="td-input"
            />
          </label>

          <RedErrorMessage name={`${fieldName.name}.contact`} />
        </div>
        <div className="form__row">
          <label>
            Téléphone ou Fax
            <Field
              type="text"
              name={`${fieldName}.phone`}
              placeholder="Numéro"
              className={`td-input ${styles.companySelectorSearchPhone}`}
            />
          </label>

          <RedErrorMessage name={`${fieldName.name}.phone`} />
        </div>
        <div className="form__row">
          <label>
            Mail
            <Field
              type="email"
              name={`${fieldName}.mail`}
              className={`td-input ${styles.companySelectorSearchEmail}`}
            />
          </label>

          <RedErrorMessage name={`${fieldName.name}.mail`} />
        </div>
      </>
    );
  }

  return null;
}
