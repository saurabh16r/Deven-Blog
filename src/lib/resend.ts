import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("Forgot Password Request: RESEND_API_KEY is missing in environment variables.");
}

const resend = new Resend(apiKey);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: any }> {
  
  if (!apiKey) {
    console.error("Forgot Password Request: RESEND_API_KEY is not defined in the environment variables.");
    return { success: false, error: 'RESEND_API_KEY is not defined in the environment variables.' };
  }

  console.log("Forgot Password Request");
  console.log(to);

  let from = 'onboarding@resend.dev';
  const customFrom = process.env.EMAIL_FROM || 'Deven <noreply@deven.com>';

  // Check if custom domain is configured and verified
  try {
    const domainMatch = customFrom.match(/@([a-zA-Z0-9.\-_]+)/);
    const domain = domainMatch ? domainMatch[1] : '';
    
    if (domain && domain !== 'resend.dev') {
      const domainsResult = await resend.domains.list();
      const isVerified = domainsResult.data?.data?.some(d => d.name.toLowerCase() === domain.toLowerCase() && d.status === 'verified');
      if (isVerified) {
        from = customFrom;
      }
    }
  } catch (err) {
    console.warn("Resend domain verification check failed. Defaulting to onboarding@resend.dev", err);
  }

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error("Resend Error details:", response.error);
      return { success: false, error: response.error };
    }

    console.log("Resend Response", response);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("Resend Exception:", error);
    return { success: false, error };
  }
}
