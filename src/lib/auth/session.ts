import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'ft_fintech_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fintech-bangladesh-super-secret-key-2026';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
}

// Simple and secure HMAC SHA-256 token encoding
async function sign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(signature).toString('base64url');
}

async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  return await crypto.subtle.verify(
    'HMAC',
    key,
    Buffer.from(signature, 'base64url'),
    enc.encode(data)
  );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = await sign(encodedPayload, SESSION_SECRET);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const isValid = await verify(encodedPayload, signature, SESSION_SECRET);
    if (!isValid) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'user',
      phone: payload.phone,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(request?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser, response?: NextResponse): Promise<string> {
  const token = await createSessionToken(user);
  const cookieOptions = {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };

  if (response) {
    response.cookies.set(cookieOptions);
  } else {
    try {
      const cookieStore = await cookies();
      cookieStore.set(cookieOptions);
    } catch {
      // Ignored if outside request context
    }
  }

  return token;
}

export async function clearSessionCookie(response?: NextResponse) {
  if (response) {
    response.cookies.delete(SESSION_COOKIE_NAME);
  } else {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch {
      // Ignored
    }
  }
}
