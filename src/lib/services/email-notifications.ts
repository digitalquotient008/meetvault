import { env } from '@/lib/env';
import { prisma } from '@/lib/db';
import { fmtDateTime } from '@/lib/format-date';
import { APP_URL } from '@/lib/constants';

type AppointmentEmailData = {
  shopId: string;
  appointmentId: string;
  customerFirstName: string;
  customerEmail: string | null;
  shopName: string;
  shopEmail: string | null;
  shopTimezone: string;
  barberName: string;
  serviceName: string;
  startDateTime: Date;
  confirmationCode: string | null;
  totalAmount: number;
  shopSlug: string;
};

async function sendEmail(to: string, subject: string, html: string, shopId: string, appointmentId: string, templateKey: string) {
  if (!env.RESEND_API_KEY) return;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'MeetingVault <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    await prisma.notificationLog.create({
      data: {
        shopId,
        appointmentId,
        channel: 'EMAIL',
        templateKey,
        status: 'SENT',
        sentAt: new Date(),
      },
    }).catch(() => {});
  } catch (err) {
    await prisma.notificationLog.create({
      data: {
        shopId,
        appointmentId,
        channel: 'EMAIL',
        templateKey,
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      },
    }).catch(() => {});
  }
}

function baseLayout(shopName: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:20px;font-weight:700;color:#f59e0b;">${shopName}</span>
    </div>
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;color:#e2e8f0;">
      ${content}
    </div>
    <p style="text-align:center;color:#64748b;font-size:11px;margin-top:24px;">
      Powered by MeetingVault
    </p>
  </div>
</body>
</html>`;
}

function detailsBlock(data: AppointmentEmailData): string {
  const when = fmtDateTime(data.startDateTime, data.shopTimezone);
  return `
    <div style="background:#0f172a;border-radius:12px;padding:16px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${data.confirmationCode ? `<tr><td style="color:#94a3b8;padding:4px 0;">Confirmation</td><td style="color:#f59e0b;font-family:monospace;text-align:right;padding:4px 0;">${data.confirmationCode}</td></tr>` : ''}
        <tr><td style="color:#94a3b8;padding:4px 0;">When</td><td style="color:#fff;text-align:right;padding:4px 0;">${when}</td></tr>
        <tr><td style="color:#94a3b8;padding:4px 0;">Service</td><td style="color:#fff;text-align:right;padding:4px 0;">${data.serviceName}</td></tr>
        <tr><td style="color:#94a3b8;padding:4px 0;">With</td><td style="color:#fff;text-align:right;padding:4px 0;">${data.barberName}</td></tr>
        ${data.totalAmount > 0 ? `<tr><td style="color:#94a3b8;padding:4px 0;">Total</td><td style="color:#fff;text-align:right;padding:4px 0;">$${data.totalAmount.toFixed(2)}</td></tr>` : ''}
      </table>
    </div>`;
}

export async function sendBookingConfirmationToClient(data: AppointmentEmailData) {
  if (!data.customerEmail) return;
  const bookingUrl = `${APP_URL}/book/${data.shopSlug}/confirm/${data.appointmentId}`;
  const html = baseLayout(data.shopName, `
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">You're booked! ✓</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">Hey ${data.customerFirstName}, your appointment at ${data.shopName} is confirmed.</p>
    ${detailsBlock(data)}
    <a href="${bookingUrl}" style="display:block;text-align:center;background:#f59e0b;color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:16px;">
      View booking details
    </a>
    <p style="text-align:center;color:#64748b;font-size:12px;margin-top:12px;">
      Need to cancel? Contact the shop directly.
    </p>
  `);
  await sendEmail(data.customerEmail, `Booking confirmed at ${data.shopName}`, html, data.shopId, data.appointmentId, 'booking_confirmed_client');
}

export async function sendBookingNotificationToShop(data: AppointmentEmailData) {
  if (!data.shopEmail) return;
  const html = baseLayout(data.shopName, `
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">New booking 📅</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">${data.customerFirstName} just booked an appointment.</p>
    ${detailsBlock(data)}
    <a href="${APP_URL}/app/appointments/${data.appointmentId}" style="display:block;text-align:center;background:#f59e0b;color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:16px;">
      View in dashboard
    </a>
  `);
  await sendEmail(data.shopEmail, `New booking: ${data.customerFirstName} — ${data.serviceName}`, html, data.shopId, data.appointmentId, 'booking_confirmed_shop');
}

export async function sendCancellationToClient(data: AppointmentEmailData) {
  if (!data.customerEmail) return;
  const html = baseLayout(data.shopName, `
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Appointment canceled</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">Hey ${data.customerFirstName}, your appointment at ${data.shopName} has been canceled.</p>
    ${detailsBlock(data)}
    <a href="${APP_URL}/book/${data.shopSlug}" style="display:block;text-align:center;background:#f59e0b;color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:16px;">
      Rebook now
    </a>
  `);
  await sendEmail(data.customerEmail, `Appointment canceled at ${data.shopName}`, html, data.shopId, data.appointmentId, 'booking_canceled_client');
}

export async function sendCancellationToShop(data: AppointmentEmailData) {
  if (!data.shopEmail) return;
  const html = baseLayout(data.shopName, `
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Booking canceled ❌</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">${data.customerFirstName}'s appointment has been canceled.</p>
    ${detailsBlock(data)}
    <a href="${APP_URL}/app/calendar" style="display:block;text-align:center;background:#f59e0b;color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:16px;">
      View calendar
    </a>
  `);
  await sendEmail(data.shopEmail, `Canceled: ${data.customerFirstName} — ${data.serviceName}`, html, data.shopId, data.appointmentId, 'booking_canceled_shop');
}

export async function sendCompletionThankYou(data: AppointmentEmailData) {
  if (!data.customerEmail) return;
  const html = baseLayout(data.shopName, `
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Thanks for visiting! 💈</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">Hey ${data.customerFirstName}, thanks for coming in today. We hope you loved it.</p>
    ${detailsBlock(data)}
    <a href="${APP_URL}/book/${data.shopSlug}" style="display:block;text-align:center;background:#f59e0b;color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:16px;">
      Book your next visit
    </a>
    <p style="text-align:center;color:#64748b;font-size:12px;margin-top:12px;">
      We'd love to see you again soon.
    </p>
  `);
  await sendEmail(data.customerEmail, `Thanks for visiting ${data.shopName}!`, html, data.shopId, data.appointmentId, 'booking_completed_client');
}

export async function sendAppointmentReminder(data: AppointmentEmailData, hoursUntil: number) {
  if (!data.customerEmail) return;
  const timeLabel = hoursUntil <= 1 ? 'in 1 hour' : `tomorrow`;
  const html = baseLayout(data.shopName, `
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Reminder: You're coming in ${timeLabel}</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 4px;">Hey ${data.customerFirstName}, just a friendly reminder about your upcoming appointment at ${data.shopName}.</p>
    ${detailsBlock(data)}
    <a href="${APP_URL}/book/${data.shopSlug}/confirm/${data.appointmentId}" style="display:block;text-align:center;background:#f59e0b;color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:16px;">
      View booking details
    </a>
    <p style="text-align:center;color:#64748b;font-size:12px;margin-top:12px;">
      Need to cancel or reschedule? Contact the shop directly.
    </p>
  `);
  const templateKey = hoursUntil <= 1 ? 'reminder_1h_client' : 'reminder_24h_client';
  await sendEmail(data.customerEmail, `Reminder: ${data.serviceName} at ${data.shopName} ${timeLabel}`, html, data.shopId, data.appointmentId, templateKey);
}

export function buildReminderSmsBody(data: AppointmentEmailData, hoursUntil: number): string {
  const when = fmtDateTime(data.startDateTime, data.shopTimezone);
  const timeLabel = hoursUntil <= 1 ? 'in 1 hour' : 'tomorrow';
  return `Reminder: Your ${data.serviceName} at ${data.shopName} is ${timeLabel} (${when}). See you soon!`;
}

export function buildEmailData(appointment: {
  id: string;
  shopId: string;
  startDateTime: Date;
  confirmationCode: string | null;
  totalAmount: unknown;
  customer: { firstName: string; email: string | null };
  barberProfile: { displayName: string };
  appointmentServices: { serviceNameSnapshot: string }[];
  shop: { name: string; email: string | null; timezone: string; slug: string };
}): AppointmentEmailData {
  return {
    shopId: appointment.shopId,
    appointmentId: appointment.id,
    customerFirstName: appointment.customer.firstName,
    customerEmail: appointment.customer.email,
    shopName: appointment.shop.name,
    shopEmail: appointment.shop.email,
    shopTimezone: appointment.shop.timezone,
    barberName: appointment.barberProfile.displayName,
    serviceName: appointment.appointmentServices[0]?.serviceNameSnapshot ?? 'Appointment',
    startDateTime: appointment.startDateTime,
    confirmationCode: appointment.confirmationCode,
    totalAmount: Number(appointment.totalAmount ?? 0),
    shopSlug: appointment.shop.slug,
  };
}
