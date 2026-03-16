import Mailgun from "mailgun.js";
import FormData from "form-data";

let mgClient: ReturnType<InstanceType<typeof Mailgun>["client"]> | null = null;

function getClient() {
  if (!mgClient) {
    const key = process.env.EMAIL_MAILGUN_API_KEY;
    if (!key) throw new Error("EMAIL_MAILGUN_API_KEY is not configured");
    const mailgun = new Mailgun(FormData);
    mgClient = mailgun.client({
      username: "api",
      key,
      url: `https://${process.env.EMAIL_MAILGUN_HOST || "api.eu.mailgun.net"}`,
    });
  }
  return mgClient;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const domain = process.env.EMAIL_MAILGUN_DOMAIN || "";
  const from = process.env.EMAIL_FROM || `noreply@${domain}`;

  await getClient().messages.create(domain, {
    from,
    to: [to],
    subject,
    html,
  });
}
