import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Field, Form as FormikForm, Formik } from "formik";
import cogoToast from "cogo-toast";
import { Mutation, MutationTakeOverSegmentArgs } from "generated/graphql/types";
import { IconBusTransfer } from "common/components/Icons";
import ActionButton from "common/components/ActionButton";
import TdModal from "common/components/Modal";
import { NotificationError } from "common/components/Error";
import DateInput from "form/common/components/custom-inputs/DateInput";
import { WorkflowActionProps } from "./WorkflowAction";
import { GET_BSDS } from "common/queries";
import { Loader } from "common/components";

const TAKE_OVER_SEGMENT = gql`
  mutation takeOverSegment($id: ID!, $takeOverInfo: TakeOverInput!) {
    takeOverSegment(id: $id, takeOverInfo: $takeOverInfo) {
      id
    }
  }
`;

export default function TakeOverSegment({ form }: WorkflowActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [takeOverSegment, { loading, error }] = useMutation<
    Pick<Mutation, "takeOverSegment">,
    MutationTakeOverSegmentArgs
  >(TAKE_OVER_SEGMENT, {
    refetchQueries: [GET_BSDS],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setIsOpen(false);
      cogoToast.success("La prise en charge du bordereau est validée", {
        hideAfter: 5,
      });
    },
    onError: () => {
      // The error is handled in the UI
    },
  });
  const transportSegments = form.transportSegments!;
  const segment = transportSegments[transportSegments.length - 1];

  const initialValues = {
    takenOverBy: "",
    takenOverAt: new Date().toISOString(),
  };

  return (
    <>
      <ActionButton
        icon={<IconBusTransfer size="24px" />}
        onClick={() => setIsOpen(true)}
      >
        Prendre en charge le déchet
      </ActionButton>
      {isOpen && (
        <TdModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          ariaLabel="Prendre en charge"
        >
          <h2 className="td-modal-title">Prendre en charge le déchet</h2>
          <Formik
            initialValues={initialValues}
            onSubmit={values => {
              const variables = {
                takeOverInfo: { ...values },
                id: segment.id,
              };

              takeOverSegment({ variables });
            }}
          >
            {({ values }) => (
              <FormikForm>
                <div className="form__row">
                  <label>
                    Nom du responsable
                    <Field
                      type="text"
                      name="takenOverBy"
                      placeholder="NOM Prénom"
                      className="td-input"
                    />
                  </label>
                </div>
                <div className="form__row">
                  <label>
                    Date de prise en charge
                    <Field
                      component={DateInput}
                      name="takenOverAt"
                      className="td-input"
                    />
                  </label>
                </div>
                {error && <NotificationError apolloError={error} />}

                <div className="form__actions">
                  <button
                    type="button"
                    className="button warning"
                    onClick={() => setIsOpen(false)}
                  >
                    Annuler
                  </button>
                  <button className="btn btn--primary" type="submit">
                    Valider
                  </button>
                </div>
              </FormikForm>
            )}
          </Formik>
          {loading && <Loader />}
        </TdModal>
      )}
    </>
  );
}
