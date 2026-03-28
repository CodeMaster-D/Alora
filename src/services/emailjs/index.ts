const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
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

async function sendEmailViaREST(templateId: string, templateParams: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  const publicKey = EMAILJS_PUBLIC_KEY;
  const privateKey = EMAILJS_PRIVATE_KEY;
  const serviceId = EMAILJS_SERVICE_ID;

  if (!publicKey || !privateKey || !serviceId || !templateId) {
    console.error("EmailJS credentials not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    const text = await response.text();
    return { success: false, error: text || `EmailJS error: ${response.status}` };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendVerificationEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_VERIFY) {
    console.error("EmailJS credentials not configured");
    return { success: false, error: "Email service not configured" };
  }

  const templateParams: Record<string, string> = {
    to_email: params.to_email,
    to_name: params.to_name || "User",
    verify_link: params.verify_link || "",
    from_name: params.from_name || "Alora",
    year: new Date().getFullYear().toString(),
  };

  return sendEmailViaREST(EMAILJS_TEMPLATE_VERIFY, templateParams);
}

export async function sendPasswordResetEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_RESET) {
    console.error("EmailJS credentials not configured");
    return { success: false, error: "Email service not configured" };
  }

  const templateParams: Record<string, string> = {
    to_email: params.to_email,
    to_name: params.to_name || "User",
    reset_link: params.reset_link || "",
    from_name: params.from_name || "Alora",
    year: new Date().getFullYear().toString(),
  };

  return sendEmailViaREST(EMAILJS_TEMPLATE_RESET, templateParams);
}
