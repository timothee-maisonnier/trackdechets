import { userFactory } from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";
import { resetDatabase } from "../../../../../integration-tests/helper";
import prisma from "../../../../prisma";
import { Mutation } from "../../../../generated/graphql/types";
import * as mailsHelper from "../../../../mailer/mailing";
import { createPasswordResetRequest } from "../../../../mailer/templates";
import { renderMail } from "../../../../mailer/templates/renderers";
import { addMinutes } from "date-fns";

// Mails spy
const sendMailSpy = jest.spyOn(mailsHelper, "sendMail");
sendMailSpy.mockImplementation(() => Promise.resolve());

const CREATE_PASSWORD_RESET_REQUEST = `
  mutation CreatePasswordResetRequest($email: String! ){
    createPasswordResetRequest(email: $email )
  }
`;

describe("mutation createPasswordResetRequest", () => {
  afterAll(resetDatabase);
  afterEach(sendMailSpy.mockClear);

  it("should initiate password reset process", async () => {
    const user = await userFactory();
    const { mutate } = makeClient();

    const { data } = await mutate<Pick<Mutation, "createPasswordResetRequest">>(
      CREATE_PASSWORD_RESET_REQUEST,
      {
        variables: { email: user.email }
      }
    );
    expect(data.createPasswordResetRequest).toEqual(true);

    const resetHash = await prisma.userResetPasswordHash.findFirst({
      where: { userId: user.id }
    });

    // expires delta is 4 hour, let's check with a slightly smaller value (3H59)
    expect(resetHash.hashExpires > addMinutes(Date.now(), 239)).toEqual(true);

    expect(sendMailSpy).toHaveBeenNthCalledWith(
      1,
      renderMail(createPasswordResetRequest, {
        to: [{ email: user.email, name: user.name }],
        variables: {
          resetHash: resetHash.hash
        }
      })
    );
  });
});
