import { BsddRevisionRequestApplied, getBsddFromActivityEvents } from "..";
import { resetDatabase } from "../../../../integration-tests/helper";
import {
  Mutation,
  MutationSubmitFormRevisionRequestApprovalArgs
} from "../../../generated/graphql/types";
import prisma from "../../../prisma";
import {
  formFactory,
  userWithCompanyFactory
} from "../../../__tests__/factories";
import makeClient from "../../../__tests__/testClient";

const CREATE_FORM = `
  mutation CreateForm($createFormInput: CreateFormInput!) {
    createForm(createFormInput: $createFormInput) {
      id
    }
}`;

const UPDATE_FORM = `
  mutation UpdateForm($updateFormInput: UpdateFormInput!) {
    updateForm(updateFormInput: $updateFormInput) {
      id
    }
  }
`;

const MARK_AS_SEALED = `
  mutation MarkAsSealed($id: ID!) {
    markAsSealed(id: $id) {
      id
      status
    }
  }
`;

const MARK_AS_SENT = `
  mutation MarkAsSent($id: ID!, $sentInfo: SentFormInput!){
    markAsSent(id: $id, sentInfo: $sentInfo){
      id
      status
    }
  }
`;

const SUBMIT_BSDD_REVISION_REQUEST_APPROVAL = `
  mutation SubmitFormRevisionRequestApproval($id: ID!, $isApproved: Boolean!) {
    submitFormRevisionRequestApproval(id: $id, isApproved: $isApproved) {
      id
    }
  }
`;

describe("ActivityEvent.Bsdd", () => {
  afterEach(resetDatabase);

  it("should create events during the workflow", async () => {
    const { user, company } = await userWithCompanyFactory("MEMBER");
    const { company: destinationCompany } = await userWithCompanyFactory(
      "MEMBER",
      {
        companyTypes: { set: ["WASTEPROCESSOR"] }
      }
    );
    const { mutate } = makeClient(user);

    // Create form
    const { data } = await mutate<Pick<Mutation, "createForm">>(CREATE_FORM, {
      variables: {
        createFormInput: {
          emitter: {
            type: "PRODUCER",
            workSite: {
              name: "",
              address: "",
              city: "",
              postalCode: "",
              infos: ""
            },
            company: {
              name: company.name,
              siret: company.siret,
              address: company.address,
              contact: "Emetteur",
              phone: "01",
              mail: "e@e.fr"
            }
          },
          recipient: {
            cap: "1234",
            processingOperation: "D 6",
            company: {
              name: destinationCompany.name,
              siret: destinationCompany.siret,
              address: "8 rue du Général de Gaulle",
              contact: "Destination",
              phone: "02",
              mail: "d@d.fr"
            },
            isTempStorage: false
          },
          transporter: {
            receipt: "sdfg",
            department: "82",
            validityLimit: "2018-12-11T00:00:00.000Z",
            numberPlate: "12345",
            company: {
              name: destinationCompany.name,
              siret: destinationCompany.siret,
              address: "8 rue du Général de Gaulle",
              contact: "Transporteur",
              phone: "03",
              mail: "t@t.fr"
            }
          },
          wasteDetails: {
            code: "01 03 04*",
            onuCode: "AAA",
            packagingInfos: [
              { type: "FUT", quantity: 1 },
              { type: "GRV", quantity: 1 }
            ],
            quantity: 1.5,
            quantityType: "REAL",
            consistence: "SOLID"
          }
        }
      }
    });

    const formId = data.createForm.id;

    const formAfterCreate = await prisma.form.findUnique({
      where: { id: formId }
    });
    const formFromEventsAfterCreate = await getBsddFromActivityEvents(formId);
    expect(formAfterCreate).toMatchObject(formFromEventsAfterCreate);
    expect(formFromEventsAfterCreate.emitterCompanyName).toBe(company.name);

    const nbEventsAfterCreate = await prisma.event.count({
      where: { streamId: formId }
    });
    expect(nbEventsAfterCreate).toBe(1);

    // Update form
    await mutate<Pick<Mutation, "updateForm">>(UPDATE_FORM, {
      variables: {
        updateFormInput: {
          id: formId,
          wasteDetails: {
            code: "01 01 01"
          }
        }
      }
    });

    const formAfterUpdate = await prisma.form.findUnique({
      where: { id: formId }
    });
    const formFromEventsAfterUpdate = await getBsddFromActivityEvents(formId);
    expect(formAfterUpdate).toMatchObject(formFromEventsAfterUpdate);
    expect(formFromEventsAfterUpdate.wasteDetailsCode).toBe("01 01 01");

    const nbEventsAfterUpdate = await prisma.event.count({
      where: { streamId: formId }
    });
    expect(nbEventsAfterUpdate).toBe(2);

    // Mark as sealed
    await mutate<Pick<Mutation, "markAsSealed">>(MARK_AS_SEALED, {
      variables: {
        id: formId
      }
    });

    const formAfterSealed = await prisma.form.findUnique({
      where: { id: formId }
    });
    const formFromEventsAfterSealed = await getBsddFromActivityEvents(formId);
    expect(formAfterSealed).toMatchObject(formFromEventsAfterSealed);
    expect(formFromEventsAfterSealed.status).toBe("SEALED");

    const nbEventsAfterSealed = await prisma.event.count({
      where: { streamId: formId }
    });
    expect(nbEventsAfterSealed).toBe(4); // +2, update + signature

    // Mark as sent
    await mutate(MARK_AS_SENT, {
      variables: {
        id: formId,
        sentInfo: { sentAt: "2018-12-11T00:00:00.000Z", sentBy: "John Doe" }
      }
    });

    const formAfterSent = await prisma.form.findUnique({
      where: { id: formId }
    });
    const formFromEventsAfterSent = await getBsddFromActivityEvents(formId);
    expect(formAfterSent).toMatchObject(formFromEventsAfterSent);
    expect(formFromEventsAfterSent.status).toBe("SENT");

    const nbEventsAfterSent = await prisma.event.count({
      where: { streamId: formId }
    });
    expect(nbEventsAfterSent).toBe(6); // +2, update + signature
  }, 10000);

  it("should create a bsdd event when a revision request is applied", async () => {
    const { company: companyOfSomeoneElse } = await userWithCompanyFactory(
      "MEMBER"
    );
    const { user, company } = await userWithCompanyFactory("MEMBER");
    const { mutate } = makeClient(user);

    const bsdd = await formFactory({
      ownerId: user.id,
      opt: { emitterCompanySiret: companyOfSomeoneElse.siret }
    });

    const revisionRequest = await prisma.bsddRevisionRequest.create({
      data: {
        bsddId: bsdd.id,
        authoringCompanyId: companyOfSomeoneElse.id,
        approvals: { create: { approverSiret: company.siret } },
        wasteDetailsCode: "01 03 08",
        comment: ""
      }
    });

    // There is only 1 approver. This will apply the revision onto the bsdd
    await mutate<
      Pick<Mutation, "submitFormRevisionRequestApproval">,
      MutationSubmitFormRevisionRequestApprovalArgs
    >(SUBMIT_BSDD_REVISION_REQUEST_APPROVAL, {
      variables: {
        id: revisionRequest.id,
        isApproved: true
      }
    });

    const eventsAfterBsddApplied = await prisma.event.findMany({
      where: { streamId: bsdd.id }
    });

    expect(eventsAfterBsddApplied.length).toBe(1);
    expect(eventsAfterBsddApplied[0].type).toBe("BsddRevisionRequestApplied");
    const eventData = eventsAfterBsddApplied[0]
      .data as BsddRevisionRequestApplied["data"];
    expect(eventData.content.wasteDetailsCode).toBe("01 03 08");
  });

  it("should enable getting a bsdd at a certain moment in time", async () => {
    const { user, company } = await userWithCompanyFactory("MEMBER");

    const { mutate } = makeClient(user);

    // Create form
    const { data } = await mutate<Pick<Mutation, "createForm">>(CREATE_FORM, {
      variables: {
        createFormInput: {
          emitter: {
            type: "PRODUCER",
            company: {
              name: company.name,
              siret: company.siret,
              address: company.address,
              contact: "Emetteur",
              phone: "01",
              mail: "e@e.fr"
            }
          },
          wasteDetails: {
            code: "01 03 04*"
          }
        }
      }
    });

    const formId = data.createForm.id;

    const now = new Date();

    // Update form
    await mutate<Pick<Mutation, "updateForm">>(UPDATE_FORM, {
      variables: {
        updateFormInput: {
          id: formId,
          wasteDetails: {
            code: "01 01 01"
          }
        }
      }
    });

    // We should now be able to get the bsdd at different stages
    const formAfterUpdate = await prisma.form.findUnique({
      where: { id: formId }
    });
    const formFromEventsAfterCreate = await getBsddFromActivityEvents(
      formId,
      now
    );
    expect(formFromEventsAfterCreate.wasteDetailsCode).toBe("01 03 04*");
    expect(formAfterUpdate.wasteDetailsCode).toBe("01 01 01");
  });
});
