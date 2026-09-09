import { mockPushStore } from '@/lib/push-mock/store';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { endpoint } = await req.json();
  mockPushStore.remove(endpoint);
  return NextResponse.json({});
}
