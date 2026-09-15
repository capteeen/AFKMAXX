import { NextResponse } from 'next/server';
import { createDesktopLink, takeDesktopToken } from '@/lib/desktop-link';
import { rateLimit, clientKey } from '@/lib/guard';

function originFrom(req: Request) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || new URL(req.url).protocol.replace(':', '') || 'http';
  if (host) return `${proto}://${host}`;
  const env = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) {
    try {
      return new URL(env).origin;
    } catch {
      /* fall through */
    }
  }
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  if (!rateLimit(`desk:${clientKey(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const { ticket } = await createDesktopLink();
  const origin = originFrom(req);
  const loginUrl = `${origin}/desktop/connect?ticket=${encodeURIComponent(ticket)}`;
  return NextResponse.json({ ticket, loginUrl });
}

export async function GET(req: Request) {
  const ticket = new URL(req.url).searchParams.get('ticket') || '';
  if (!ticket) return NextResponse.json({ error: 'Missing ticket' }, { status: 400 });
  if (!rateLimit(`desk-poll:${clientKey(req)}:${ticket.slice(0, 8)}`, 90, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const result = await takeDesktopToken(ticket);
  if (result.status === 'missing') return NextResponse.json({ status: 'missing' }, { status: 404 });
  if (result.status === 'expired') return NextResponse.json({ status: 'expired' }, { status: 410 });
  return NextResponse.json(result);
}
