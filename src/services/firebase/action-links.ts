import { 
  generatePasswordResetLink as adminGenerateResetLink, 
  generateEmailVerificationLink as adminGenerateVerifyLink 
} from "@/services/firebase/admin";

export interface ActionLinkResult {
  oobLink: string;
  oobCode: string;
}

export async function generateEmailVerificationLink(email: string): Promise<ActionLinkResult> {
  return adminGenerateVerifyLink(email);
}

export async function generatePasswordResetLink(email: string): Promise<ActionLinkResult> {
  return adminGenerateResetLink(email);
}
