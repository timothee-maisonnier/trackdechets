import {
  CompanyType,
  Status,
  UserRole,
  WasteAcceptationStatus
} from "@prisma/client";
import { format } from "date-fns";
import { resetDatabase } from "../../../../../integration-tests/helper";
import { allowedFormats } from "../../../../common/dates";
import {
  Mutation,
  MutationMarkAsAcceptedArgs
} from "../../../../generated/graphql/types";
import prisma from "../../../../prisma";
import {
  formFactory,
  userFactory,
  userWithCompanyFactory
} from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";
import { prepareDB, prepareRedis } from "../../../__tests__/helpers";

const MARK_AS_ACCEPTED = `
  mutation MarkAsAccepted($id: ID!, $acceptedInfo: AcceptedFormInput!){
    markAsAccepted(id: $id, acceptedInfo: $acceptedInfo){
      id
      status
    }
  }
`;

describe("Test Form reception", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it("should mark a received form as accepted", async () => {
    const {
      emitterCompany,
      recipient,
      recipientCompany,
      form: initialForm
    } = await prepareDB();
    const form = await prisma.form.update({
      where: { id: initialForm.id },
      data: {
        status: "RECEIVED",
        receivedBy: "Bill",
        receivedAt: new Date("2019-01-17T10:22:00+0100")
      }
    });
    await prepareRedis({
      emitterCompany,
      recipientCompany
    });

    const { mutate } = makeClient(recipient);

    await mutate(MARK_AS_ACCEPTED, {
      variables: {
        id: form.id,
        acceptedInfo: {
          signedAt: "2019-01-17T10:22:00+0100",
          signedBy: "Bill",
          wasteAcceptationStatus: "ACCEPTED",
          quantityReceived: 11
        }
      }
    });

    const acceptedForm = await prisma.form.findUnique({
      where: { id: form.id }
    });

    expect(acceptedForm.status).toBe("ACCEPTED");
    expect(acceptedForm.wasteAcceptationStatus).toBe("ACCEPTED");
    expect(acceptedForm.signedBy).toBe("Bill");
    expect(acceptedForm.quantityReceived).toBe(11);

    // A StatusLog object is created
    const logs = await prisma.statusLog.findMany({
      where: { form: { id: acceptedForm.id }, user: { id: recipient.id } }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe("ACCEPTED");
  });

  it("should not accept negative values", async () => {
    const { emitterCompany, recipient, recipientCompany, form } =
      await prepareDB();
    await prisma.form.update({
      where: { id: form.id },
      data: {
        status: "RECEIVED",
        receivedBy: "Bill",
        receivedAt: new Date("2019-01-17T10:22:00+0100")
      }
    });

    await prepareRedis({
      emitterCompany,
      recipientCompany
    });

    const { mutate } = makeClient(recipient);
    // payload contains a negative quantity value, which must not be accepted
    await mutate(MARK_AS_ACCEPTED, {
      variables: {
        id: form.id,
        acceptedInfo: {
          signedBy: "Bill",
          signedAt: "2019-01-17T10:22:00+0100",
          wasteAcceptationStatus: "ACCEPTED",
          quantityReceived: -2
        }
      }
    });

    const frm = await prisma.form.findUnique({ where: { id: form.id } });
    // form was not accepted, still sent
    expect(frm.status).toBe("RECEIVED");
    expect(frm.wasteAcceptationStatus).toBe(null);
    expect(frm.signedBy).toBe(null);
    expect(frm.quantityReceived).toBe(null);
  });

  it("should not accept 0 value when form is accepted", async () => {
    const { emitterCompany, recipient, recipientCompany, form } =
      await prepareDB();
    await prisma.form.update({
      where: { id: form.id },
      data: {
        status: "RECEIVED",
        receivedBy: "Bill",
        receivedAt: new Date("2019-01-17T10:22:00+0100")
      }
    });

    await prepareRedis({
      emitterCompany,
      recipientCompany
    });

    const { mutate } = makeClient(recipient);
    // payload contains a null quantity value whereas wasteAcceptationStatus is ACCEPTED, which is invalid
    await mutate(MARK_AS_ACCEPTED, {
      variables: {
        id: form.id,
        acceptedInfo: {
          signedBy: "Bill",
          signedAt: "2019-01-17T10:22:00+0100",
          wasteAcceptationStatus: "ACCEPTED",
          quantityReceived: 0
        }
      }
    });

    const frm = await prisma.form.findUnique({ where: { id: form.id } });
    // form was not accepted, still sent
    expect(frm.status).toBe("RECEIVED");
    expect(frm.wasteAcceptationStatus).toBe(null);
    expect(frm.signedBy).toBe(null);
    expect(frm.quantityReceived).toBe(null);
  });

  it("should mark a received form as refused", async () => {
    const { emitterCompany, recipient, recipientCompany, form } =
      await prepareDB();
    await prisma.form.update({
      where: { id: form.id },
      data: {
        status: "RECEIVED",
        receivedBy: "Bill",
        receivedAt: new Date("2019-01-17T10:22:00+0100")
      }
    });
    await prepareRedis({
      emitterCompany,
      recipientCompany
    });
    const { mutate } = makeClient(recipient);

    await mutate(MARK_AS_ACCEPTED, {
      variables: {
        id: form.id,
        acceptedInfo: {
          signedBy: "Holden",
          signedAt: "2019-01-17T10:22:00+0100",
          wasteAcceptationStatus: "REFUSED",
          wasteRefusalReason: "Lorem ipsum",
          quantityReceived: 0
        }
      }
    });

    const frm = await prisma.form.findUnique({ where: { id: form.id } });

    // form was refused
    expect(frm.status).toBe("REFUSED");
    expect(frm.wasteAcceptationStatus).toBe("REFUSED");
    expect(frm.signedBy).toBe("Holden");
    expect(frm.wasteRefusalReason).toBe("Lorem ipsum");
    expect(frm.quantityReceived).toBe(0); // quantityReceived is set to 0

    // A StatusLog object is created
    const logs = await prisma.statusLog.findMany({
      where: { form: { id: frm.id }, user: { id: recipient.id } }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe("REFUSED");
  });

  it("should not accept a non-zero quantity when waste is refused", async () => {
    const { emitterCompany, recipient, recipientCompany, form } =
      await prepareDB();
    await prisma.form.update({
      where: { id: form.id },
      data: {
        status: "RECEIVED",
        receivedBy: "Bill",
        receivedAt: new Date("2019-01-17T10:22:00+0100")
      }
    });
    await prepareRedis({
      emitterCompany,
      recipientCompany
    });
    const { mutate } = makeClient(recipient);
    // trying to refuse waste with a non-zero quantityReceived
    await mutate(MARK_AS_ACCEPTED, {
      variables: {
        id: form.id,
        acceptedInfo: {
          signedBy: "Holden",
          signedAt: "2019-01-17T10:22:00+0100",
          wasteAcceptationStatus: "REFUSED",
          wasteRefusalReason: "Lorem ipsum",
          quantityReceived: 21
        }
      }
    });

    const frm = await prisma.form.findUnique({ where: { id: form.id } });

    // form is still sent
    expect(frm.status).toBe("RECEIVED");

    expect(frm.wasteAcceptationStatus).toBe(null);
    expect(frm.signedBy).toBe(null);
    expect(frm.quantityReceived).toBe(null);

    // No StatusLog object was created
    const logs = await prisma.statusLog.findMany({
      where: { form: { id: frm.id }, user: { id: recipient.id } }
    });
    expect(logs.length).toBe(0);
  });

  it("should mark a received form as partially refused", async () => {
    const { emitterCompany, recipient, recipientCompany, form } =
      await prepareDB();
    await prisma.form.update({
      where: { id: form.id },
      data: {
        status: "RECEIVED",
        receivedBy: "Bill",
        receivedAt: new Date("2019-01-17T10:22:00+0100")
      }
    });
    await prepareRedis({
      emitterCompany,
      recipientCompany
    });
    const { mutate } = makeClient(recipient);

    await mutate(MARK_AS_ACCEPTED, {
      variables: {
        id: form.id,
        acceptedInfo: {
          signedBy: "Carol",
          signedAt: "2019-01-17T10:22:00+0100",
          wasteAcceptationStatus: "PARTIALLY_REFUSED",
          wasteRefusalReason: "Dolor sit amet",
          quantityReceived: 12.5
        }
      }
    });

    const frm = await prisma.form.findUnique({ where: { id: form.id } });
    // form was not accepted
    expect(frm.status).toBe("ACCEPTED");
    expect(frm.wasteAcceptationStatus).toBe("PARTIALLY_REFUSED");
    expect(frm.signedBy).toBe("Carol");
    expect(frm.wasteRefusalReason).toBe("Dolor sit amet");
    expect(frm.quantityReceived).toBe(12.5);

    // A StatusLog object is created
    const logs = await prisma.statusLog.findMany({
      where: { form: { id: frm.id }, user: { id: recipient.id } }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe("ACCEPTED");
  });

  test.each(allowedFormats)(
    "%p should be a valid format for signedAt",
    async f => {
      const owner = await userFactory();
      const { user, company: destination } = await userWithCompanyFactory(
        UserRole.MEMBER,
        {
          companyTypes: { set: [CompanyType.WASTEPROCESSOR] }
        }
      );

      const form = await formFactory({
        ownerId: owner.id,
        opt: {
          status: Status.RECEIVED,
          receivedBy: "Bill",
          recipientCompanySiret: destination.siret,
          receivedAt: new Date("2019-01-17")
        }
      });

      const { mutate } = makeClient(user);

      const signedAt = new Date("2019-01-18");

      await mutate(MARK_AS_ACCEPTED, {
        variables: {
          id: form.id,
          acceptedInfo: {
            signedAt: format(signedAt, f),
            signedBy: "Bill",
            wasteAcceptationStatus: WasteAcceptationStatus.ACCEPTED,
            quantityReceived: 11
          }
        }
      });

      const acceptedForm = await prisma.form.findUnique({
        where: { id: form.id }
      });

      expect(acceptedForm.status).toBe(Status.ACCEPTED);
      expect(acceptedForm.signedAt).toEqual(signedAt);
    }
  );

  it("should unlink appendix 2 in case of refusal", async () => {
    const { user: ttrUser, company: ttr } = await userWithCompanyFactory(
      UserRole.MEMBER,
      {
        companyTypes: { set: [CompanyType.COLLECTOR] }
      }
    );
    const { user: destinationUser, company: destination } =
      await userWithCompanyFactory(UserRole.MEMBER, {
        companyTypes: { set: [CompanyType.WASTEPROCESSOR] }
      });

    const form1 = await formFactory({
      ownerId: ttrUser.id,
      opt: {
        status: "GROUPED",
        processingOperationDone: "R 13",
        recipientCompanySiret: ttr.siret,
        quantityReceived: 1
      }
    });

    const form2 = await formFactory({
      ownerId: ttrUser.id,
      opt: {
        status: "GROUPED",
        processingOperationDone: "R 13",
        recipientCompanySiret: ttr.siret,
        quantityReceived: 1
      }
    });

    const groupementForm = await formFactory({
      ownerId: ttrUser.id,
      opt: {
        emitterType: "APPENDIX2",
        emitterCompanySiret: ttr.siret,
        status: Status.RECEIVED,
        receivedBy: "Bill",
        recipientCompanySiret: destination.siret,
        receivedAt: new Date("2019-01-17"),
        grouping: {
          createMany: {
            data: [
              { initialFormId: form1.id, quantity: form1.quantityReceived },
              { initialFormId: form2.id, quantity: form2.quantityReceived }
            ]
          }
        }
      }
    });

    const { mutate } = makeClient(destinationUser);

    await mutate<Pick<Mutation, "markAsAccepted">, MutationMarkAsAcceptedArgs>(
      MARK_AS_ACCEPTED,
      {
        variables: {
          id: groupementForm.id,
          acceptedInfo: {
            wasteAcceptationStatus: "REFUSED",
            wasteRefusalReason: "Parce que",
            signedAt: "2019-01-18" as any,
            signedBy: "John",
            quantityReceived: 0
          }
        }
      }
    );

    const updatedForm1 = await prisma.form.findUnique({
      where: { id: form1.id }
    });
    const updatedForm2 = await prisma.form.findUnique({
      where: { id: form2.id }
    });
    expect(updatedForm1.status).toEqual("AWAITING_GROUP");
    expect(updatedForm2.status).toEqual("AWAITING_GROUP");

    const groupement = await prisma.form
      .findUnique({
        where: { id: groupementForm.id }
      })
      .grouping({ include: { initialForm: true } });

    const appendix2Forms = groupement.map(g => g.initialForm);

    expect(appendix2Forms).toEqual([]);
  });
});
