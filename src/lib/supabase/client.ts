import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getClientSupabaseUrl(): string {
  if (typeof window !== 'undefined') {
    // In browser, route through our same-origin HTTPS proxy to prevent Mixed Content blocking on Vercel
    return `${window.location.origin}/api/supabase-proxy`;
  }
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'http://supabasekong-a5tg2fvpwj6emkewfdknamid.187.77.159.209.sslip.io'
  );
}

export function createClient() {
  const url = getClientSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window === 'undefined') {
    return createBrowserClient(url, anonKey);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(url, anonKey);
  }

  return clientInstance;
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = createClient();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});
