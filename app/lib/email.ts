type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type?: string;
  }>;
};

export const isEmailConfigured = () => {
  return Boolean(process.env.EMAIL_FROM && process.env.RESEND_API_KEY);
};

export async function sendEmail(payload: EmailPayload) {
  if (!isEmailConfigured()) {
    throw new Error("Email is not configured.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      attachments: payload.attachments,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Resend email failed (${response.status}): ${errorBody || "Unknown error"}`
    );
  }
}
