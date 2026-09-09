import { mockPushStore } from '@/lib/push-mock/store';
import { NextRequest, NextResponse } from 'next/server';

// TESTING-ONLY MOCK — see src/lib/push-mock/store.ts. Delete this whole
// src/app/api/v1/push/client/ tree once the real backend ships these
// endpoints; the frontend already calls PUSH_SUBSCRIBE_ROUTE either way
// (see route.api.ts), so nothing else needs to change — just flip
// NEXT_PUBLIC_PUSH_MOCK back to false.
export async function POST(req: NextRequest) {
  const body = await req.json();
  mockPushStore.add(body);
  return NextResponse.json({});
}
