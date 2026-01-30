type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export const isEmailConfigured = () => false;

export async function sendEmail(payload: EmailPayload) {
  throw new Error("Email is disabled.");
}
