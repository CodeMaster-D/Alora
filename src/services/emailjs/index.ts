import emailjs from "@emailjs/browser";

const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_VERIFY = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_VERIFY;
const EMAILJS_TEMPLATE_RESET = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET;

export interface EmailParams {
  to_email: string;
  to_name?: string;
  verify_link?: string;
  reset_link?: string;
  from_name?: string;
}

export async function sendVerificationEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_VERIFY) {
    console.error("EmailJS credentials not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name || "User",
      verify_link: params.verify_link || "",
      from_name: params.from_name || "Alora",
      year: new Date().getFullYear().toString(),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_VERIFY,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Failed to send email" };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendPasswordResetEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_RESET) {
    console.error("EmailJS credentials not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name || "User",
      reset_link: params.reset_link || "",
      from_name: params.from_name || "Alora",
      year: new Date().getFullYear().toString(),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_RESET,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      return { success: true };
    }
    return { success: false, error: "Failed to send email" };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID };
