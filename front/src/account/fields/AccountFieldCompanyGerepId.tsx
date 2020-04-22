import React from "react";
import gql from "graphql-tag";
import AccountField from "./AccountField";
import AccountFormSimpleInput from "./forms/AccountFormSimpleInput";
import { Company } from "../AccountCompany";

type Props = {
  company: Company;
};

AccountFielCompanyGerepId.fragments = {
  company: gql`
    fragment AccountFieldCompanyGerepIdFragment on CompanyPrivate {
      siret
      gerepId
    }
  `,
};

const UPDATE_GEREP_ID = gql`
  mutation UpdateCompany($siret: String!, $gerepId: String) {
    updateCompany(siret: $siret, gerepId: $gerepId) {
      id
      siret
      gerepId
    }
  }
`;

export default function AccountFielCompanyGerepId({ company }: Props) {
  return (
    <AccountField
      name="gerepId"
      label="Identifiant GEREP"
      value={company.gerepId}
      renderForm={(toggleEdition) => (
        <AccountFormSimpleInput<{ gerepId: string }>
          name="gerepId"
          type="text"
          value={company.gerepId}
          placeHolder="Identifiant GEREP"
          mutation={UPDATE_GEREP_ID}
          mutationArgs={{ siret: company.siret }}
          toggleEdition={() => {
            toggleEdition();
          }}
        />
      )}
    />
  );
}
