// backend/src/utils/mailer.ts (example)
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { env } from '../env.js';
import logger from './logger.js';

let transporterPromise: Promise<Transporter> | null = null;

async function createTransporter(): Promise<Transporter> {
  // For tests use ethereal
  if (env.NODE_ENV === 'test') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  if (!env.APP_EMAIL_ADDRESS || !process.env.APP_EMAIL_PASSWORD) {
    throw new Error(
      'Email is not configured: set APP_EMAIL_ADDRESS and APP_EMAIL_PASSWORD',
    );
  }

  // Use explicit SMTP options (avoid service: 'gmail' so you control port/timeouts)
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // try 465 (secure) first
    secure: true,
    auth: {
      user: env.APP_EMAIL_ADDRESS,
      pass: process.env.APP_EMAIL_PASSWORD, // app password
    },
    connectionTimeout: 15000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
    tls: {
      // do not disable in production; only set for debugging if necessary:
      rejectUnauthorized: true,
    },
  });
}

async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    const tx = await createTransporter();

    // verify but DO NOT throw into request path—catch and log instead
    try {
      await tx.verify();
      logger.info('SMTP verified');
    } catch (verifyErr) {
      // log but do not throw — caller should handle send failure gracefully
      logger.error('SMTP verify failed (non-fatal):', verifyErr);
      // still return transporter: sendMail may still work or fail later
    }
    return tx;
  })();

  return transporterPromise;
}

export async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  let transporter: Transporter | null = null;
  try {
    transporter = await getTransporter();
  } catch (err) {
    // In case getTransporter throws (lack of env etc) handle here
    logger.error('getTransporter failed:', err);
    // Don't throw raw error to user - return a sentinel or boolean so caller can continue.
    throw new Error('Email subsystem unavailable');
  }

  const mailOptions = {
    from: payload.from ?? env.APP_EMAIL_ADDRESS,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };

  try {
    const info = (await transporter.sendMail(mailOptions)) as SentMessageInfo;
    logger.info('Email sent', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return info;
  } catch (err) {
    logger.error('Error sending email', err);
    // bubble a sanitized error so caller can decide (or you can return null)
    throw new Error('Email send failed');
  }
}
