const FIREBASE_REST_API = "https://identitytoolkit.googleapis.com/v1/accounts:oobConfig";

function getFirebaseApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured");
  }
  return apiKey;
}

export interface ActionLinkResult {
  oobLink: string;
  oobCode: string;
}

export async function generateEmailVerificationLink(email: string): Promise<ActionLinkResult> {
  const apiKey = getFirebaseApiKey();
  
  const response = await fetch(`${FIREBASE_REST_API}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestType: "VERIFY_EMAIL",
      email: email,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate verification link");
  }

  const data = await response.json();
  return {
    oobLink: data.oobLink,
    oobCode: data.oobCode,
  };
}

export async function generatePasswordResetLink(email: string): Promise<ActionLinkResult> {
  const apiKey = getFirebaseApiKey();
  
  const response = await fetch(`${FIREBASE_REST_API}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestType: "PASSWORD_RESET",
      email: email,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate reset link");
  }

  const data = await response.json();
  return {
    oobLink: data.oobLink,
    oobCode: data.oobCode,
  };
}
