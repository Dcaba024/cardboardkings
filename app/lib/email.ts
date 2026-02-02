type EmailPayload = {
  to: string | string[];
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
  const requestBody = {
    from: process.env.EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const retry = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (retry.ok) {
        return;
      }
      const retryBody = await retry.text();
      throw new Error(
        `Resend email failed (${retry.status}): ${retryBody || "Unknown error"}`
      );
    }
    throw new Error(
      `Resend email failed (${response.status}): ${errorBody || "Unknown error"}`
    );
  }
}
