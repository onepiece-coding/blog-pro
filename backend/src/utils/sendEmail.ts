import nodemailer, { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';
import logger from './logger.js';
import { env } from '../env.js';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string; // optional override
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = env.BREVO_API_KEY ?? undefined;
const DEFAULT_FROM = env.FROM_EMAIL ?? env.APP_EMAIL_ADDRESS;
const DEFAULT_TIMEOUT_MS = Number(env.EMAIL_TIMEOUT_MS ?? 10000);

let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async (): Promise<Transporter> => {
    // test env: use nodemailer test account (this is what your tests expect)
    if (env.NODE_ENV === 'test') {
      const testAccount = await nodemailer.createTestAccount();
      const tx = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      return tx;
    }

    // non-test env: fall back to classic SMTP config (same behaviour as before)
    if (!env.APP_EMAIL_ADDRESS || !process.env.APP_EMAIL_PASSWORD) {
      throw new Error(
        'Email is not configured: set APP_EMAIL_ADDRESS and APP_EMAIL_PASSWORD',
      );
    }

    const tx = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });

    // verify once at creation (keeps existing behaviour)
    await tx.verify();
    return tx;
  })();

  return transporterPromise;
}

function timeoutFetch(input: RequestInfo, init: RequestInit = {}, timeout = DEFAULT_TIMEOUT_MS) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);
  return fetch(input, { ...init, signal: ac.signal }).finally(() => clearTimeout(id));
}

/**
 * sendEmail:
 * - If running tests (NODE_ENV === 'test') => use nodemailer test account (mocked in tests).
 * - Else if BREVO_API_KEY is set => send via Brevo HTTP API.
 * - Else => use nodemailer with APP_EMAIL_ADDRESS + APP_EMAIL_PASSWORD.
 *
 * Accepts optional transporterOverride (used by tests).
 */
export async function sendEmail(
  { to, subject, html, from }: EmailPayload,
  transporterOverride?: Transporter,
): Promise<SentMessageInfo | string | any> {
  // If not test and BREVO_API_KEY exists, use Brevo HTTP API (avoids SMTP issues in Render)
  if (env.NODE_ENV !== 'test' && BREVO_API_KEY) {
    const payload = {
      sender: { email: from ?? DEFAULT_FROM, name: 'Your App' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    let res: Response;
    try {
      res = await timeoutFetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
      }, DEFAULT_TIMEOUT_MS);
    } catch (networkErr: any) {
      const message = networkErr?.name === 'AbortError' ? 'Request timed out' : networkErr?.message;
      logger.error('Brevo network error', { message, stack: networkErr?.stack });
      throw new Error('Internal Server Error (email network)');
    }

    const contentType = res.headers.get('content-type') ?? '';
    let body: any = null;
    if (contentType.includes('application/json')) {
      try { body = await res.json(); } catch { body = null; }
    } else {
      try { body = await res.text(); } catch { body = null; }
    }

    if (!res.ok) {
      logger.error('Brevo API error', {
        status: res.status,
        statusText: res.statusText,
        body,
      });
      throw new Error('Internal Server Error (email send)');
    }

    logger.info('Brevo send success', { status: res.status, body });
    return body;
  }

  // Otherwise use nodemailer path (test + fallback to SMTP)
  const transporter = transporterOverride ?? (await getTransporter());

  const mailOptions: SendMailOptions = {
    from: from ?? DEFAULT_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = (await transporter.sendMail(mailOptions)) as SentMessageInfo;

    if (env.NODE_ENV === 'test') {
      const preview = nodemailer.getTestMessageUrl(info);
      return preview ?? info;
    }

    logger.info('Email sent:', {
      messageId: info.messageId,
      accepted: info.accepted?.length ?? 0,
      rejected: info.rejected?.length ?? 0,
    });

    return info;
  } catch (err) {
    logger.error('Error sending email', {
      message: (err as Error).message,
      stack: (err as any)?.stack,
    });
    throw new Error('Internal Server Error (email send)');
  }
}

export default sendEmail;