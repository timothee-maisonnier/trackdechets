import { Status, WasteAcceptationStatus } from "@prisma/client";
import { Machine } from "xstate";
import { PROCESSING_OPERATIONS_GROUPEMENT_CODES } from "../../common/constants";
import { Event, EventType } from "./types";

/**
 * Workflow state machine
 */
const machine = Machine<any, Event>(
  {
    id: "form-workflow-machine",
    initial: Status.DRAFT,
    states: {
      [Status.DRAFT]: {
        on: {
          [EventType.MarkAsSealed]: [{ target: Status.SEALED }],
          [EventType.MarkAsSent]: [{ target: Status.SENT }]
        }
      },
      [Status.SEALED]: {
        on: {
          [EventType.MarkAsSent]: [{ target: Status.SENT }],
          [EventType.SignedByTransporter]: [
            {
              target: Status.SENT
            }
          ],
          [EventType.ImportPaperForm]: [
            {
              target: Status.NO_TRACEABILITY,
              cond: "isExemptOfTraceability"
            },
            { target: Status.AWAITING_GROUP, cond: "awaitsGroup" },
            { target: Status.PROCESSED }
          ],
          [EventType.SignedByProducer]: [
            {
              target: Status.SIGNED_BY_PRODUCER
            }
          ]
        }
      },
      [Status.SIGNED_BY_PRODUCER]: {
        on: {
          [EventType.SignedByTransporter]: [
            {
              target: Status.SENT
            }
          ]
        }
      },
      [Status.SENT]: {
        on: {
          [EventType.MarkAsTempStored]: [
            {
              target: Status.REFUSED,
              cond: "isFormRefusedByTempStorage"
            },
            {
              target: Status.TEMP_STORER_ACCEPTED,
              cond: "isFormAcceptedByTempStorage"
            },
            {
              target: Status.TEMP_STORED
            }
          ],
          [EventType.MarkAsReceived]: [
            {
              target: Status.REFUSED,
              cond: "isFormRefused"
            },
            {
              target: Status.ACCEPTED,
              cond: "isFormAccepted"
            },
            {
              target: Status.RECEIVED
            }
          ]
        }
      },
      [Status.REFUSED]: { type: "final" },
      [Status.RECEIVED]: {
        on: {
          [EventType.MarkAsAccepted]: [
            {
              target: Status.REFUSED,
              cond: "isFormRefused"
            },
            {
              target: Status.ACCEPTED
            }
          ]
        }
      },
      [Status.ACCEPTED]: {
        on: {
          [EventType.MarkAsProcessed]: [
            {
              target: Status.NO_TRACEABILITY,
              cond: "isExemptOfTraceability"
            },
            {
              target: Status.AWAITING_GROUP,
              cond: "awaitsGroup"
            },
            {
              target: Status.PROCESSED
            }
          ]
        }
      },
      [Status.PROCESSED]: { type: "final" },
      [Status.NO_TRACEABILITY]: { type: "final" },
      [Status.AWAITING_GROUP]: {
        on: {
          [EventType.MarkAsGrouped]: { target: Status.GROUPED }
        }
      },
      [Status.GROUPED]: {
        on: { [EventType.MarkAsProcessed]: { target: Status.PROCESSED } }
      },
      [Status.TEMP_STORED]: {
        on: {
          [EventType.MarkAsTempStorerAccepted]: [
            {
              target: Status.REFUSED,
              cond: "isFormRefusedByTempStorage"
            },
            {
              target: Status.TEMP_STORER_ACCEPTED
            }
          ]
        }
      },
      [Status.TEMP_STORER_ACCEPTED]: {
        on: {
          [EventType.MarkAsResealed]: [
            {
              target: Status.RESEALED
            }
          ],
          [EventType.MarkAsResent]: [
            {
              target: Status.RESENT
            }
          ]
        }
      },
      [Status.RESEALED]: {
        on: {
          [EventType.MarkAsResent]: [
            {
              target: Status.RESENT
            }
          ],
          [EventType.SignedByTransporter]: [
            {
              target: Status.RESENT
            }
          ],
          [EventType.SignedByTempStorer]: [
            {
              target: Status.SIGNED_BY_TEMP_STORER
            }
          ]
        }
      },
      [Status.SIGNED_BY_TEMP_STORER]: {
        on: {
          [EventType.MarkAsResent]: [
            {
              target: Status.RESENT
            }
          ]
        }
      },
      [Status.RESENT]: {
        on: {
          [EventType.MarkAsReceived]: [
            {
              target: Status.REFUSED,
              cond: "isFormRefused"
            },
            {
              target: Status.ACCEPTED,
              cond: "isFormAccepted"
            },
            {
              target: Status.RECEIVED
            }
          ]
        }
      },
      error: {
        states: {}
      }
    }
  },
  {
    guards: {
      isExemptOfTraceability: (_, event) =>
        !!event?.formUpdateInput?.noTraceability,
      awaitsGroup: (_, event) =>
        PROCESSING_OPERATIONS_GROUPEMENT_CODES.includes(
          event.formUpdateInput?.processingOperationDone as string
        ),
      isFormRefused: (_, event) =>
        event.formUpdateInput?.wasteAcceptationStatus === "REFUSED",
      isFormAccepted: (_, event) =>
        [
          WasteAcceptationStatus.ACCEPTED,
          WasteAcceptationStatus.PARTIALLY_REFUSED
        ].includes(event.formUpdateInput?.wasteAcceptationStatus as any),
      isFormRefusedByTempStorage: (_, event) =>
        event.formUpdateInput?.temporaryStorageDetail?.update
          ?.tempStorerWasteAcceptationStatus === "REFUSED",
      isFormAcceptedByTempStorage: (_, event) =>
        [
          WasteAcceptationStatus.ACCEPTED,
          WasteAcceptationStatus.PARTIALLY_REFUSED
        ].includes(
          event.formUpdateInput?.temporaryStorageDetail?.update
            ?.tempStorerWasteAcceptationStatus as any
        )
    }
  }
);

export default machine;
