import React, { useEffect } from "react";
import { Formik, Field, Form, useFormikContext } from "formik";
import {
  PROCESSING_OPERATIONS,
  PROCESSING_OPERATIONS_GROUPEMENT_CODES,
} from "generated/constants";
import DateInput from "form/common/components/custom-inputs/DateInput";
import CompanySelector from "form/common/components/company/CompanySelector";
import {
  Form as TdForm,
  FormStatus,
  Mutation,
  MutationMarkAsProcessedArgs,
  ProcessedFormInput,
} from "generated/graphql/types";
import { gql, useMutation } from "@apollo/client";
import { statusChangeFragment } from "common/fragments";
import { WorkflowActionProps } from "./WorkflowAction";
import { TdModalTrigger } from "common/components/Modal";
import { ActionButton, Loader } from "common/components";
import { IconCogApproved } from "common/components/Icons";
import { NotificationError } from "common/components/Error";
import cogoToast from "cogo-toast";
import { GET_BSDS } from "common/queries";

const MARK_AS_PROCESSED = gql`
  mutation MarkAsProcessed($id: ID!, $processedInfo: ProcessedFormInput!) {
    markAsProcessed(id: $id, processedInfo: $processedInfo) {
      ...StatusChange
    }
  }
  ${statusChangeFragment}
`;

function ProcessedInfo({ form, close }: { form: TdForm; close: () => void }) {
  const {
    values: { processingOperationDone, noTraceability, nextDestination },
    setFieldValue,
  } = useFormikContext<MutationMarkAsProcessedArgs["processedInfo"]>();

  const isGroupement =
    processingOperationDone &&
    PROCESSING_OPERATIONS_GROUPEMENT_CODES.includes(processingOperationDone);

  useEffect(() => {
    if (isGroupement) {
      if (nextDestination == null) {
        setFieldValue("nextDestination", {
          processingOperation: "",
          company: {
            siret: "",
            name: "",
            address: "",
            contact: "",
            mail: "",
            phone: "",
          },
        });
      }
      if (noTraceability == null) {
        setFieldValue("noTraceability", false);
      }
    } else {
      setFieldValue("nextDestination", null);
      setFieldValue("noTraceability", null);
    }
  }, [isGroupement, nextDestination, noTraceability, setFieldValue]);

  return (
    <Form>
      <div className="form__row">
        <label>
          Nom du responsable
          <Field
            type="text"
            name="processedBy"
            placeholder="NOM Prénom"
            className="td-input"
          />
        </label>
      </div>
      <div className="form__row">
        <label>
          Date de traitement
          <Field
            component={DateInput}
            name="processedAt"
            className="td-input"
          />
        </label>
      </div>
      <div className="form__row">
        <label>Opération d’élimination / valorisation effectuée</label>
        <Field
          component="select"
          name="processingOperationDone"
          className="td-select"
        >
          <option value="">Choisissez...</option>
          {PROCESSING_OPERATIONS.map(operation => (
            <option key={operation.code} value={operation.code}>
              {operation.code} - {operation.description.substr(0, 50)}
              {operation.description.length > 50 ? "..." : ""}
            </option>
          ))}
        </Field>
        <div>
          Code de traitement prévu :{" "}
          {form.temporaryStorageDetail?.destination?.processingOperation ??
            form.recipient?.processingOperation}
        </div>
      </div>
      <div className="form__row">
        <label>
          Description de l'Opération
          <Field
            component="textarea"
            name="processingOperationDescription"
            className="td-textarea"
          />
        </label>
      </div>
      {isGroupement && noTraceability !== null && (
        <>
          <div className="form__row form__row--inline">
            <Field
              type="checkbox"
              name="noTraceability"
              id="id_noTraceability"
              className="td-checkbox"
            />

            <label htmlFor="id_noTraceability">
              {" "}
              Rupture de traçabilité autorisée par arrêté préfectoral pour ce
              déchet - la responsabilité du producteur du déchet est transférée
            </label>
          </div>
          {noTraceability && (
            <div className="notification">
              La destination ultérieure prévue est optionnelle si les déchets
              sont envoyés vers des destinations différentes et que vous n'êtes
              pas en mesure de déterminer l'exutoire final à ce stade. Le code
              de traitement final prévu reste obligatoire.
            </div>
          )}
        </>
      )}

      {nextDestination && (
        <div className="form__row">
          <h4 className="h4">Destination ultérieure prévue</h4>
          <div className="form__row">
            <label>Opération d’élimination / valorisation (code D/R)</label>
            <Field
              component="select"
              name="nextDestination.processingOperation"
              className="td-select"
            >
              <option value="">Choisissez...</option>
              {PROCESSING_OPERATIONS.map(operation => (
                <option key={operation.code} value={operation.code}>
                  {operation.code} - {operation.description.substr(0, 50)}
                  {operation.description.length > 50 ? "..." : ""}
                </option>
              ))}
            </Field>
          </div>
          <CompanySelector
            name="nextDestination.company"
            allowForeignCompanies={true}
            displayVatSearch={false}
            skipFavorite={noTraceability === true}
            optional={noTraceability === true}
          />
        </div>
      )}
      <div className="form__actions">
        <button
          type="button"
          className="btn btn--outline-primary"
          onClick={close}
        >
          Annuler
        </button>
        <button type="submit" className="btn btn--primary">
          Je valide
        </button>
      </div>
    </Form>
  );
}

export default function MarkAsProcessed({ form, siret }: WorkflowActionProps) {
  const [markAsProcessed, { loading, error }] = useMutation<
    Pick<Mutation, "markAsProcessed">,
    MutationMarkAsProcessedArgs
  >(MARK_AS_PROCESSED, {
    refetchQueries: [GET_BSDS],
    awaitRefetchQueries: true,
    onCompleted: data => {
      if (
        data.markAsProcessed &&
        data.markAsProcessed.status === FormStatus.Processed
      ) {
        cogoToast.success(
          `Le traitement du déchet a bien été validé. Vous pouvez retrouver ce bordereau dans l'onglet "Archives".`
        );
      }
    },
    onError: () => {
      // The error is handled in the UI
    },
  });

  const actionLabel = "Valider le traitement";

  return (
    <TdModalTrigger
      ariaLabel={actionLabel}
      trigger={open => (
        <ActionButton icon={<IconCogApproved size="24px" />} onClick={open}>
          {actionLabel}
        </ActionButton>
      )}
      modalContent={close => (
        <div>
          <Formik<ProcessedFormInput>
            initialValues={{
              processingOperationDone: "",
              processingOperationDescription: "",
              processedBy: "",
              processedAt: new Date().toISOString(),
              nextDestination: null,
              noTraceability: null,
            }}
            onSubmit={({ nextDestination, ...values }) => {
              const cleanedNextDestination = nextDestination;
              if (cleanedNextDestination?.company) {
                // clean vatNumber that may have been added by CompanySelector
                delete cleanedNextDestination.company["vatNumber"];
              }
              return markAsProcessed({
                variables: {
                  id: form.id,
                  processedInfo: {
                    ...values,
                    nextDestination: cleanedNextDestination,
                  },
                },
              });
            }}
          >
            <ProcessedInfo form={form} close={close} />
          </Formik>
          {error && (
            <NotificationError className="action-error" apolloError={error} />
          )}
          {loading && <Loader />}
        </div>
      )}
    />
  );
}
