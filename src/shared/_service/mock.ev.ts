import type { IChargingBranch, IWallet } from './interface.ev';

// STUB DATA — replace with real API responses once APP_EV routes exist
// (see route.api.ts). Positions are around Tehran so the default map
// center (config/map.config.ts mapConfig.center) shows something.
export const MOCK_BRANCHES: IChargingBranch[] = [
  {
    id: 'branch-1',
    name: 'ایستگاه شارژ ولیعصر',
    address: 'تهران، خیابان ولیعصر، نرسیده به پارک ملت',
    position: { lat: 35.7594, lng: 51.4106 },
    status: 'AVAILABLE',
    deviceCode: 'EVB-0001',
    connectors: [
      { id: 'c1', type: 'TYPE2', powerKw: 22, status: 'AVAILABLE' },
      { id: 'c2', type: 'CCS2', powerKw: 50, status: 'IN_USE' },
    ],
  },
  {
    id: 'branch-2',
    name: 'ایستگاه شارژ میرداماد',
    address: 'تهران، خیابان میرداماد، پارکینگ طبقاتی',
    position: { lat: 35.7581, lng: 51.4254 },
    status: 'FULL',
    deviceCode: 'EVB-0002',
    connectors: [
      { id: 'c3', type: 'TYPE2', powerKw: 22, status: 'IN_USE' },
      { id: 'c4', type: 'TYPE2', powerKw: 22, status: 'IN_USE' },
    ],
  },
  {
    id: 'branch-3',
    name: 'ایستگاه شارژ سعادت‌آباد',
    address: 'تهران، سعادت‌آباد، بلوار فرهنگ',
    position: { lat: 35.7808, lng: 51.3707 },
    status: 'OUT_OF_SERVICE',
    deviceCode: 'EVB-0003',
    connectors: [{ id: 'c5', type: 'CHADEMO', powerKw: 50, status: 'OUT_OF_SERVICE' }],
  },
];

export const MOCK_WALLET: IWallet = {
  balance: 1_250_000,
  currency: 'IRT',
  transactions: [
    {
      id: 't1',
      type: 'TOPUP',
      amount: 1_000_000,
      createdAt: new Date().toISOString(),
      description: 'افزایش موجودی کیف پول',
    },
    {
      id: 't2',
      type: 'CHARGE_PAYMENT',
      amount: -250_000,
      createdAt: new Date().toISOString(),
      description: 'پرداخت شارژ - ایستگاه ولیعصر',
    },
  ],
};

export async function fetchMockBranches(): Promise<IChargingBranch[]> {
  return Promise.resolve(MOCK_BRANCHES);
}

export async function fetchMockBranch(id: string): Promise<IChargingBranch | undefined> {
  return Promise.resolve(MOCK_BRANCHES.find((b) => b.id === id));
}

export async function fetchMockBranchByCode(code: string): Promise<IChargingBranch> {
  // Small artificial delay so ScanScreen's 'resolving' state is actually
  // visible in dev instead of flashing for one frame.
  await new Promise((r) => setTimeout(r, 400));
  const branch = MOCK_BRANCHES.find((b) => b.deviceCode === code);
  if (!branch) throw new Error('branch_not_found');
  return branch;
}

export async function fetchMockWallet(): Promise<IWallet> {
  return Promise.resolve(MOCK_WALLET);
}
