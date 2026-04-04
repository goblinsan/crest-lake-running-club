export interface EmailPayload {
  to: string;
  name: string;
  subject: string;
  body: string;
}

/**
 * Sends an email notification. This is a stub implementation that logs the
 * email to the console. Replace the body of this function with a real email
 * provider (e.g. nodemailer, SendGrid, Resend) when one is configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('--- [EMAIL NOTIFICATION] ---');
  // eslint-disable-next-line no-console
  console.log(`To:      ${payload.to} (${payload.name})`);
  // eslint-disable-next-line no-console
  console.log(`Subject: ${payload.subject}`);
  // eslint-disable-next-line no-console
  console.log(`Body:\n${payload.body}`);
  // eslint-disable-next-line no-console
  console.log('----------------------------');
}

export function buildReminderEmail(
  name: string,
  eventTitle: string,
  eventDate: Date,
  eventLocation: string | null,
): EmailPayload {
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    to: '',
    name,
    subject: `Reminder: ${eventTitle} is coming up!`,
    body: [
      `Hi ${name},`,
      '',
      `This is a friendly reminder that you have RSVPed to "${eventTitle}".`,
      '',
      `📅 ${dateStr}`,
      eventLocation ? `📍 ${eventLocation}` : null,
      '',
      "We hope to see you there! Don't forget to bring water and comfortable running shoes.",
      '',
      'Happy running,',
      'Crest Lake Running Club',
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
  };
}
