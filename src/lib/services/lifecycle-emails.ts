import { env } from '@/lib/env';
import { prisma } from '@/lib/db';
import { APP_URL } from '@/lib/constants';

/**
 * Lifecycle email service — handles the full user journey:
 * welcome, trial onboarding sequence, conversion, and win-back.
 *
 * All emails are idempotent: uses NotificationLog templateKey to
 * prevent duplicates. Safe to call repeatedly from cron.
 */

// ─── Helper ───

async function sendLifecycleEmail(params: {
  to: string;
  subject: string;
  html: string;
  shopId: string;
  templateKey: string;
}) {
  if (!env.RESEND_API_KEY) return;

  // Check if already sent
  const existing = await prisma.notificationLog.findFirst({
    where: { shopId: params.shopId, templateKey: params.templateKey },
  });
  if (existing) return;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'MeetVault <onboarding@resend.dev>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    await prisma.notificationLog.create({
      data: {
        shopId: params.shopId,
        channel: 'EMAIL',
        templateKey: params.templateKey,
        status: 'SENT',
        sentAt: new Date(),
      },
    }).catch(() => {});
  } catch (err) {
    await prisma.notificationLog.create({
      data: {
        shopId: params.shopId,
        channel: 'EMAIL',
        templateKey: params.templateKey,
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Unknown',
      },
    }).catch(() => {});
  }
}

function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:700;color:#f59e0b;">MeetVault</span>
    </div>
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;color:#e2e8f0;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:20px;">
      <a href="${APP_URL}" style="color:#64748b;font-size:11px;text-decoration:none;">meetvault.app</a>
      <p style="color:#475569;font-size:10px;margin-top:8px;">
        You're receiving this because you signed up for MeetVault.<br/>
        <a href="mailto:support@meetvault.app" style="color:#475569;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(text: string, url: string, color = '#f59e0b'): string {
  return `<a href="${url}" style="display:block;text-align:center;background:${color};color:#0f172a;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:20px;">${text}</a>`;
}

// ─── Individual Email Templates ───

export async function sendWelcomeEmail(shopId: string, email: string, shopName: string, firstName: string) {
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Welcome to MeetVault, ${firstName}!</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Your shop <strong style="color:#fff;">${shopName}</strong> is set up. Here's what to do next:
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#f59e0b;font-weight:700;width:24px;vertical-align:top;">1.</td>
          <td style="padding:8px 0;color:#e2e8f0;font-size:14px;"><strong>Share your booking link</strong> — send it to clients so they can start booking online.</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#f59e0b;font-weight:700;vertical-align:top;">2.</td>
          <td style="padding:8px 0;color:#e2e8f0;font-size:14px;"><strong>Set up no-show protection</strong> — enable deposits in Settings so you never lose money to empty chairs again.</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#f59e0b;font-weight:700;vertical-align:top;">3.</td>
          <td style="padding:8px 0;color:#e2e8f0;font-size:14px;"><strong>Import your clients</strong> — upload a CSV from your old system (Squire, Booksy, Vagaro) to bring everyone over.</td>
        </tr>
      </table>
    </div>
    <p style="color:#64748b;font-size:13px;">Your 14-day free trial is active. You won't be charged until it ends.</p>
    ${ctaButton('Go to your dashboard', `${APP_URL}/app`)}
    <p style="text-align:center;color:#64748b;font-size:12px;margin-top:16px;">
      Questions? Reply to this email or reach us at <a href="mailto:support@meetvault.app" style="color:#f59e0b;">support@meetvault.app</a>
    </p>
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `Welcome to MeetVault — let's get ${shopName} set up`,
    html,
    shopId,
    templateKey: 'welcome',
  });
}

export async function sendTrialStartedEmail(shopId: string, email: string, firstName: string, trialEndsAt: Date) {
  const endDate = trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Your free trial is active</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;">
      Hey ${firstName}, your 14-day trial started today. You have full access to every feature — no restrictions.
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
      <p style="color:#64748b;font-size:12px;margin:0;">Trial ends</p>
      <p style="color:#f59e0b;font-size:20px;font-weight:700;margin:4px 0 0;">${endDate}</p>
      <p style="color:#64748b;font-size:12px;margin:4px 0 0;">You won't be charged until then. Cancel anytime.</p>
    </div>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
      <strong style="color:#fff;">Pro tip:</strong> The #1 thing that makes barbers stick with MeetVault? Setting up deposit-required booking. It stops no-shows on day one.
    </p>
    ${ctaButton('Set up no-show protection', `${APP_URL}/app/settings/shop`)}
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `Your MeetVault trial is active — here's how to get the most out of it`,
    html,
    shopId,
    templateKey: 'trial_started',
  });
}

// ─── Drip Sequence (called by cron) ───

/**
 * Day 3: Feature highlight — deposits and no-show protection.
 * The core value prop. If they haven't set up deposits yet, this nudges them.
 */
async function sendDay3Email(shopId: string, email: string, firstName: string) {
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Are you still losing money to no-shows?</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;">
      Hey ${firstName}, the average barber loses $200–$400/month to empty chairs. The fix takes 2 minutes:
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="color:#e2e8f0;font-size:14px;margin:0 0 12px;"><strong style="color:#f59e0b;">Step 1:</strong> Go to Settings → No-show fee</p>
      <p style="color:#e2e8f0;font-size:14px;margin:0 0 12px;"><strong style="color:#f59e0b;">Step 2:</strong> Set a deposit amount ($10–$15 works best)</p>
      <p style="color:#e2e8f0;font-size:14px;margin:0;"><strong style="color:#f59e0b;">Step 3:</strong> Toggle "Require card to complete booking"</p>
    </div>
    <p style="color:#94a3b8;font-size:14px;">
      That's it. Every booking now collects a card. If they ghost, you keep the deposit. Most barbers see <strong style="color:#fff;">60–80% fewer no-shows</strong> in the first week.
    </p>
    ${ctaButton('Turn on no-show protection', `${APP_URL}/app/settings/shop`)}
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `The 2-minute fix that stops no-shows`,
    html,
    shopId,
    templateKey: 'trial_day3',
  });
}

/**
 * Day 7: Mid-trial check-in. Casual, helpful, not salesy.
 */
async function sendDay7Email(shopId: string, email: string, firstName: string) {
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">How's the first week going?</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;">
      Hey ${firstName}, you're halfway through your trial. Quick check-in — have you:
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#e2e8f0;font-size:14px;">☐ Shared your booking link with clients?</td></tr>
        <tr><td style="padding:6px 0;color:#e2e8f0;font-size:14px;">☐ Enabled deposit-required booking?</td></tr>
        <tr><td style="padding:6px 0;color:#e2e8f0;font-size:14px;">☐ Imported your client list?</td></tr>
        <tr><td style="padding:6px 0;color:#e2e8f0;font-size:14px;">☐ Set your availability hours?</td></tr>
      </table>
    </div>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
      If you've got questions or something isn't working right, just reply to this email. I read every one.
    </p>
    ${ctaButton('Open your dashboard', `${APP_URL}/app`)}
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `Quick check-in — how's MeetVault working for you?`,
    html,
    shopId,
    templateKey: 'trial_day7',
  });
}

/**
 * Day 10: Urgency + value reminder. 4 days left.
 */
async function sendDay10Email(shopId: string, email: string, firstName: string, shopName: string) {
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">4 days left on your trial</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;">
      Hey ${firstName}, your MeetVault trial for <strong style="color:#fff;">${shopName}</strong> ends in 4 days. After that, your subscription starts at $25/month.
    </p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
      Here's what you'll keep when your trial converts:
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:5px 0;color:#10b981;width:20px;vertical-align:top;">✓</td><td style="padding:5px 0;color:#e2e8f0;font-size:14px;">All your client data and history</td></tr>
        <tr><td style="padding:5px 0;color:#10b981;vertical-align:top;">✓</td><td style="padding:5px 0;color:#e2e8f0;font-size:14px;">Your booking page and link</td></tr>
        <tr><td style="padding:5px 0;color:#10b981;vertical-align:top;">✓</td><td style="padding:5px 0;color:#e2e8f0;font-size:14px;">Deposit and no-show protection</td></tr>
        <tr><td style="padding:5px 0;color:#10b981;vertical-align:top;">✓</td><td style="padding:5px 0;color:#e2e8f0;font-size:14px;">Appointment reminders (email + SMS)</td></tr>
        <tr><td style="padding:5px 0;color:#10b981;vertical-align:top;">✓</td><td style="padding:5px 0;color:#e2e8f0;font-size:14px;">Growth tools and revenue reports</td></tr>
      </table>
    </div>
    <p style="color:#94a3b8;font-size:14px;">
      If MeetVault isn't right for you, cancel anytime from <a href="${APP_URL}/app/settings/billing" style="color:#f59e0b;">Settings → Billing</a>. No hard feelings.
    </p>
    ${ctaButton('Go to your dashboard', `${APP_URL}/app`)}
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `4 days left on your MeetVault trial`,
    html,
    shopId,
    templateKey: 'trial_day10',
  });
}

/**
 * Sent when subscription converts from trialing → active.
 */
export async function sendSubscriptionActiveEmail(shopId: string, email: string, firstName: string) {
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">You're officially on MeetVault</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;">
      Hey ${firstName}, your trial converted and your subscription is now active. $25/month — everything included, no surprises.
    </p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
      A few things you might not have tried yet:
    </p>
    <div style="background:#0f172a;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="color:#e2e8f0;font-size:14px;margin:0 0 10px;">→ <strong>Growth tools</strong> — see which clients are due for rebooking</p>
      <p style="color:#e2e8f0;font-size:14px;margin:0 0 10px;">→ <strong>Revenue reports</strong> — track earnings by day, by service</p>
      <p style="color:#e2e8f0;font-size:14px;margin:0;">→ <strong>Walk-in queue</strong> — manage walk-ins with a digital queue</p>
    </div>
    <p style="color:#64748b;font-size:13px;">
      Manage your subscription anytime from <a href="${APP_URL}/app/settings/billing" style="color:#f59e0b;">Settings → Billing</a>.
    </p>
    ${ctaButton('Open your dashboard', `${APP_URL}/app`)}
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `You're on MeetVault — here's what's next`,
    html,
    shopId,
    templateKey: 'subscription_active',
  });
}

/**
 * Sent when trial expires without converting (canceled or payment failed).
 */
export async function sendTrialExpiredEmail(shopId: string, email: string, firstName: string, shopName: string) {
  const html = emailLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Your MeetVault trial has ended</h1>
    <p style="color:#94a3b8;font-size:15px;line-height:1.6;">
      Hey ${firstName}, your 14-day trial for <strong style="color:#fff;">${shopName}</strong> has ended. Your dashboard is paused until you resubscribe.
    </p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
      Your data is safe — we'll keep everything (clients, appointments, settings) for 30 days. Nothing is deleted.
    </p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
      If you'd like to come back, it takes one click. $25/month, same plan, all your data intact.
    </p>
    ${ctaButton('Reactivate for $25/month', `${APP_URL}/app/onboarding/subscribe`)}
    <p style="text-align:center;color:#64748b;font-size:12px;margin-top:16px;">
      Not the right time? No worries. We'll be here when you're ready.
    </p>
  `);

  await sendLifecycleEmail({
    to: email,
    subject: `Your MeetVault trial ended — your data is safe for 30 days`,
    html,
    shopId,
    templateKey: 'trial_expired',
  });
}

// ─── Drip Sequence Processor (called by cron) ───

/**
 * Process all trial drip emails for all shops.
 * Each email is sent once per shop (idempotent via NotificationLog).
 * Called by /api/cron/send-reminders every 15 minutes.
 */
export async function processTrialDripSequence(): Promise<number> {
  if (!env.RESEND_API_KEY) return 0;

  const now = new Date();
  let sent = 0;

  // Find all shops in trialing or recently expired state
  const shops = await prisma.shop.findMany({
    where: {
      trialEndsAt: { not: null },
      createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    },
    select: {
      id: true,
      name: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      createdAt: true,
      memberships: {
        where: { role: 'OWNER', isActive: true },
        include: { user: true },
        take: 1,
      },
    },
  });

  for (const shop of shops) {
    const owner = shop.memberships[0]?.user;
    if (!owner?.email) continue;

    const firstName = owner.firstName || 'there';
    const trialStart = shop.createdAt;
    const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

    // Day 3: Feature highlight
    if (daysSinceStart >= 3 && daysSinceStart < 7) {
      await sendDay3Email(shop.id, owner.email, firstName);
      sent++;
    }

    // Day 7: Mid-trial check-in
    if (daysSinceStart >= 7 && daysSinceStart < 10) {
      await sendDay7Email(shop.id, owner.email, firstName);
      sent++;
    }

    // Day 10: Urgency nudge
    if (daysSinceStart >= 10 && daysSinceStart < 12) {
      await sendDay10Email(shop.id, owner.email, firstName, shop.name);
      sent++;
    }

    // Trial expired (status changed to canceled/past_due and past trial end)
    if (
      shop.trialEndsAt &&
      now > shop.trialEndsAt &&
      shop.subscriptionStatus !== 'active' &&
      shop.subscriptionStatus !== 'trialing'
    ) {
      await sendTrialExpiredEmail(shop.id, owner.email, firstName, shop.name);
      sent++;
    }
  }

  return sent;
}
