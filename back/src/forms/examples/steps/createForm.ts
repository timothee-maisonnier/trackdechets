import mutations from "../mutations";
import fixtures from "../fixtures";
import { WorkflowStep } from "../../../common/workflow";

export function createForm(company: string): WorkflowStep {
  return {
    description: `Les informations du BSDD sont remplies. Cette action peut-être effectuée
  par n'importe quel établissement apparaissant sur le BSDD. À ce stade il est toujours possible
  d'effectuer des modifications grâce à la mutation updateForm.`,
    mutation: mutations.createForm,
    variables: ({ producteur, transporteur, traiteur }) => ({
      createFormInput: {
        emitter: fixtures.emitterInput(producteur.siret),
        recipient: fixtures.recipientInput(traiteur.siret),
        transporter: fixtures.transporterInput(transporteur.siret),
        wasteDetails: fixtures.wasteDetailsInput
      }
    }),
    expected: { status: "DRAFT" },
    data: response => response.createForm,
    company,
    setContext: (ctx, data) => ({ ...ctx, bsd: data })
  };
}

export function createFormMultiModal(company: string): WorkflowStep {
  return {
    ...createForm(company),
    variables: ({ transporteur1, producteur, traiteur }) =>
      createForm(company).variables({
        transporteur: transporteur1,
        producteur,
        traiteur
      })
  };
}

/** Creates a form that will be grouped */
export function createInitialForm(company: string): WorkflowStep {
  return {
    ...createForm(company),
    variables: ({ producteur, transporteur, ttr }) => ({
      createFormInput: {
        emitter: fixtures.emitterInput(producteur.siret),
        recipient: fixtures.ttrInput(ttr.siret),
        transporter: fixtures.transporterInput(transporteur.siret),
        wasteDetails: fixtures.wasteDetailsInput
      }
    })
  };
}

export function createGroupementForm(company: string): WorkflowStep {
  return {
    ...createForm(company),
    description:
      "Le BSDD de regroupement est crée en annexant le borderau initial et en affectant la totalité de la quantité disponible" +
      " Pour faire simple dans cet exemple, un seul bordereau initial est annexé mais dans la majorité des cas il y en aura plusieurs." +
      " Pour fractionner le BSDD initial dans plusieurs annexes 2 il est possible de spécificier une quantité inférieure à la quantité disponible." +
      " La quantité restante pourra être utilisée dans d'autres annexes 2." +
      " Le bordereau initial passera de l'état AWAITING_GROUP à l'état GROUPED lorsque tous ses bordereaux de regroupement seront SEALED." +
      " Le bordereau initial passera de l'état GROUPED à l'état PROCESSED lorsque tous ses bordereaux de regroupement seront PROCESSED",
    variables: ({ transporteur2, ttr, traiteur, initialBsd }) => {
      return {
        createFormInput: {
          emitter: {
            type: "APPENDIX2",
            company: fixtures.ttrCompanyInput(ttr.siret)
          },
          recipient: fixtures.recipientInput(traiteur.siret),
          transporter: fixtures.transporterInput(transporteur2.siret),
          wasteDetails: fixtures.wasteDetailsInput,
          grouping: [
            {
              form: { id: initialBsd.id },
              quantity: initialBsd.quantityReceived
            }
          ]
        }
      };
    }
  };
}

export function createFormTempStorage(company: string): WorkflowStep {
  return {
    ...createForm(company),
    variables: ({ producteur, ttr, transporteur1, traiteur }) => ({
      createFormInput: {
        emitter: fixtures.emitterInput(producteur.siret),
        recipient: fixtures.recipientIsTempStorageInput(ttr.siret),
        transporter: fixtures.transporterInput(transporteur1.siret),
        wasteDetails: fixtures.wasteDetailsInput,
        temporaryStorageDetail: {
          destination: fixtures.recipientInput(traiteur.siret)
        }
      }
    })
  };
}
