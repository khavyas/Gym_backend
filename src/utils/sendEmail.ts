import { BrevoClient } from "@getbrevo/brevo";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const sendEmail = async (options: SendEmailOptions) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "Hiwox Gym App";

  if (!apiKey) {
    throw new Error("Missing Brevo API key. Set BREVO_API_KEY in environment.");
  }

  if (!fromEmail) {
    throw new Error("Missing sender email. Set EMAIL_FROM in environment.");
  }

  try {
    const brevo = new BrevoClient({ apiKey });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: options.subject,
      htmlContent: options.html,
      sender: { name: fromName, email: fromEmail },
      to: [{ email: options.to }],
    });

    console.log("✅ Email sent successfully via Brevo:", result?.messageId);
    return result;
  } catch (error: any) {
    const errorMessage = error?.body?.message || error?.message || "Unknown error";
    console.error("❌ Error sending email via Brevo:", errorMessage);
    throw new Error("Email sending failed: " + errorMessage);
  }
};

export default sendEmail;
