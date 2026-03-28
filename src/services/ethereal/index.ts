import * as nodemailer from "nodemailer";

export interface EmailParams {
  to_email: string;
  to_name?: string;
  verify_link?: string;
  reset_link?: string;
}

let etherealAccount: { user: string; pass: string; web: string } | null = null;

async function getEtherealTransporter() {
  if (!etherealAccount) {
    etherealAccount = await nodemailer.createTestAccount();
    console.log("📧 Ethereal Email Account Created:");
    console.log("   User:", etherealAccount.user);
    console.log("   Pass:", etherealAccount.pass);
    console.log("   Web:", etherealAccount.web);
    console.log("");
  }
  
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: etherealAccount.user,
      pass: etherealAccount.pass,
    },
  });
}

const VERIFY_EMAIL_HTML = (verify_link: string, to_name: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Atkinson Hyperlegible', Helvetica, Arial, sans-serif; background-color: #f4f5f4; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f5f4; padding-bottom: 40px; }
        .main { background-color: #ffffff; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8e2; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); margin-top: 40px; }
        .header { background-color: #7fa384; padding: 50px 20px; text-align: center; color: white; }
        .content { padding: 40px 35px; text-align: center; color: #3c443d; }
        .title { font-size: 26px; font-weight: 700; margin-bottom: 16px; color: #1a1d1a; letter-spacing: -0.5px; }
        .text { font-size: 17px; line-height: 1.7; margin-bottom: 35px; color: #555f56; }
        .button { display: inline-block; padding: 18px 36px; background-color: #7fa384; color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(127, 163, 132, 0.3); }
        .footer { padding: 25px; text-align: center; font-size: 13px; color: #8a958c; line-height: 1.5; }
        .divider { height: 1px; background-color: #edf0ed; margin: 35px 0; }
        .accent-text { color: #7fa384; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <h1 style="margin:0; font-size: 32px; letter-spacing: -1px;">Alora</h1>
                <p style="margin-top: 8px; opacity: 0.9; font-weight: 400;">Your Mental Wellness Sanctuary</p>
            </div>
            <div class="content">
                <h2 class="title">Begin Your Journey</h2>
                <p class="text">Hi ${to_name},<br>Thank you for choosing <span class="accent-text">Alora</span>. Please verify your email.</p>
                <a href="${verify_link}" class="button">Verify My Email</a>
                <div class="divider"></div>
                <p style="font-size: 14px; color: #8a958c;">Copy link: <span style="color: #7fa384; word-break: break-all;">${verify_link}</span></p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} <strong>Alora</strong>. If you didn't request this, ignore this email.</div>
        </div>
    </div>
</body>
</html>
`;

const RESET_PASSWORD_HTML = (reset_link: string, to_name: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Atkinson Hyperlegible', Helvetica, Arial, sans-serif; background-color: #f4f5f4; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f5f4; padding-bottom: 40px; }
        .main { background-color: #ffffff; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8e2; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); margin-top: 40px; }
        .header { background-color: #D48C70; padding: 50px 20px; text-align: center; color: white; }
        .content { padding: 40px 35px; text-align: center; color: #3c443d; }
        .title { font-size: 26px; font-weight: 700; margin-bottom: 16px; color: #1a1d1a; letter-spacing: -0.5px; }
        .text { font-size: 17px; line-height: 1.7; margin-bottom: 35px; color: #555f56; }
        .button { display: inline-block; padding: 18px 36px; background-color: #D48C70; color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 140, 112, 0.3); }
        .footer { padding: 25px; text-align: center; font-size: 13px; color: #8a958c; line-height: 1.5; }
        .divider { height: 1px; background-color: #edf0ed; margin: 35px 0; }
        .accent-text { color: #D48C70; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <h1 style="margin:0; font-size: 32px; letter-spacing: -1px;">Alora</h1>
                <p style="margin-top: 8px; opacity: 0.9; font-weight: 400;">Your Mental Wellness Sanctuary</p>
            </div>
            <div class="content">
                <h2 class="title">Reset Your Password</h2>
                <p class="text">Hi ${to_name},<br>Click below to reset your <span class="accent-text">Alora</span> password.</p>
                <a href="${reset_link}" class="button">Reset Password</a>
                <div class="divider"></div>
                <p style="font-size: 14px; color: #8a958c;">Copy link: <span style="color: #D48C70; word-break: break-all;">${reset_link}</span></p>
                <p style="font-size: 14px; color: #8a958c; margin-top: 20px;">If you didn't request this, ignore this email.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} <strong>Alora</strong>.</div>
        </div>
    </div>
</body>
</html>
`;

export async function sendVerificationEmail(params: EmailParams): Promise<{ success: boolean; error?: string; previewUrl?: string }> {
  try {
    const transporter = await getEtherealTransporter();
    
    const info = await transporter.sendMail({
      from: '"Alora" <noreply@alora.web.id>',
      to: params.to_email,
      subject: "Verify your email - Alora",
      html: VERIFY_EMAIL_HTML(params.verify_link || "", params.to_name || "User"),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log("✅ Verification email sent (Ethereal):", previewUrl);
    
    return { success: true, previewUrl };
  } catch (error) {
    console.error("Ethereal email error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendPasswordResetEmail(params: EmailParams): Promise<{ success: boolean; error?: string; previewUrl?: string }> {
  try {
    const transporter = await getEtherealTransporter();
    
    const info = await transporter.sendMail({
      from: '"Alora" <noreply@alora.web.id>',
      to: params.to_email,
      subject: "Reset your password - Alora",
      html: RESET_PASSWORD_HTML(params.reset_link || "", params.to_name || "User"),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log("✅ Password reset email sent (Ethereal):", previewUrl);
    
    return { success: true, previewUrl };
  } catch (error) {
    console.error("Ethereal email error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
