import logger from './logger.js';
import { env } from '../env.js';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = env.BREVO_API_KEY!;
const DEFAULT_FROM = env.FROM_EMAIL ?? env.APP_EMAIL_ADDRESS;
const DEFAULT_TIMEOUT_MS = Number(env.EMAIL_TIMEOUT_MS ?? 10000);

if (!API_KEY) {
  throw new Error('BREVO_API_KEY not set in environment');
}

function timeoutFetch(input: RequestInfo, init: RequestInit = {}, timeout = DEFAULT_TIMEOUT_MS) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);
  return fetch(input, { ...init, signal: ac.signal }).finally(() => clearTimeout(id));
}

export async function sendEmail(
  { to, subject, html, from }: EmailPayload,
): Promise<any> {
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
        'api-key': API_KEY,            // Brevo expects the API key in this header for HTTP calls
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
    try {
      body = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      body = null;
    }
  } else {
    try {
      body = await res.text();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      body = null;
    }
  }

  if (!res.ok) {
    logger.error('Brevo API error', {
      status: res.status,
      statusText: res.statusText,
      body,
    });
    // Generic internal error for clients; logs contain the details.
    throw new Error('Internal Server Error (email send)');
  }

  logger.info('Brevo send success', { status: res.status, body });
  return body;
}

export default sendEmail;