import { NextRequest, NextResponse } from 'next/server';

const TARGET_BASE_URL = (
  process.env.SUPABASE_CATALOG_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'http://supabasekong-a5tg2fvpwj6emkewfdknamid.187.77.159.209.sslip.io'
).replace(/\/+$/, '');

const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const subpath = (resolvedParams.path || []).join('/');
    const search = request.nextUrl.search;
    const targetUrl = `${TARGET_BASE_URL}/${subpath}${search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers, host, and encoding headers that fetch handles natively
      if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(lower)) {
        headers.set(key, value);
      }
    });

    // Ensure apikey header is set if missing
    if (!headers.has('apikey') && ANON_KEY) {
      headers.set('apikey', ANON_KEY);
    }

    const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: 'follow',
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['content-encoding', 'transfer-encoding'].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    // Forward set-cookie headers safely
    if (typeof (response.headers as any).getSetCookie === 'function') {
      const cookies: string[] = (response.headers as any).getSetCookie();
      cookies.forEach((cookie: string) => responseHeaders.append('set-cookie', cookie));
    } else {
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        responseHeaders.set('set-cookie', setCookie);
      }
    }

    // Always ensure CORS headers are present for same-origin or preview calls
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Supabase Proxy Error]:', error);
    return NextResponse.json(
      { error: 'Supabase proxy request failed', details: error.message },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
