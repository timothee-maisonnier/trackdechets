import { Job } from "bull";
import { sendMailSync } from "../../mailer/mailing";
import { initSentry } from "../../common/sentry";
import { Mail } from "../../mailer/types";

const Sentry = initSentry();

export default async function sendMailJob(job: Job<Mail>) {
  try {
    return sendMailSync(job.data);
  } catch (err) {
    Sentry.captureException(err);
  }
}
