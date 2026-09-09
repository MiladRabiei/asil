import { mockPushStore } from '@/lib/push-mock/store';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { endpoint, topics } = await req.json();
  const ok = mockPushStore.updateTopics(endpoint, topics);
  if (!ok) return NextResponse.json({ message: 'subscription_not_found' }, { status: 404 });
  return NextResponse.json({});
}
