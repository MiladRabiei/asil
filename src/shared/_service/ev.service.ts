// Plain (non-hook) EV-domain service calls — for imperative call sites like
// useQrScanner, which need to `await` a lookup inside a callback rather than
// subscribe to a query. Hook-based reads/writes (branch list, wallet, push)
// live in hook.query.tsx / hook.mutation.tsx instead; this file is only for
// the handful of calls that don't fit that shape.
import api from '@/lib/axiosInstance';
import { runtimeConfig } from '@/config/runtime.config';
import type { IChargingBranch } from './interface.ev';
import { fetchMockBranchByCode } from './mock.ev';
import { BRANCH_BY_CODE_ROUTE } from './route.api';

// STUB — same runtimeConfig.useMockEvData flag as hook.query.tsx/discovery.ts.
// Flip NEXT_PUBLIC_USE_MOCK_EV_DATA=false once BRANCH_BY_CODE_ROUTE is live;
// callers don't change.
const USE_MOCK_EV_DATA = runtimeConfig.useMockEvData;

export async function lookupBranchByCode(code: string): Promise<IChargingBranch> {
  if (USE_MOCK_EV_DATA) return fetchMockBranchByCode(code);
  return api.get<IChargingBranch>(BRANCH_BY_CODE_ROUTE(code))();
}
