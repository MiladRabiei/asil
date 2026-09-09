// EV-domain types — STUB shapes, all field names are best guesses pending
// backend confirmation (see route.api.ts APP_EV routes). Nothing about the
// exact fields is final; treat this file the way interface.schema.ts's
// Roles comment treats roles — the one place names are declared, so this is
// the one file that needs to change once a real API contract exists.

export type IBranchStatus = 'AVAILABLE' | 'FULL' | 'OUT_OF_SERVICE';
export type IConnectorStatus = 'AVAILABLE' | 'IN_USE' | 'OUT_OF_SERVICE';
export type IConnectorType = 'TYPE2' | 'CCS2' | 'CHADEMO';

export interface IChargingConnector {
  id: string;
  type: IConnectorType;
  powerKw: number;
  status: IConnectorStatus;
}

export interface IChargingBranch {
  id: string;
  name: string;
  address: string;
  position: { lat: number; lng: number };
  status: IBranchStatus;
  connectors: IChargingConnector[];
  // Device identification code printed on-site — what the QR scanner reads,
  // or what the user types in through manual entry.
  deviceCode?: string;
}

export type IChargingSessionStatus = 'STARTING' | 'CHARGING' | 'COMPLETED' | 'FAILED' | 'STOPPED';

export interface IChargingSession {
  id: string;
  branchId: string;
  connectorId: string;
  status: IChargingSessionStatus;
  startedAt: string;
  endedAt?: string;
  energyKwh?: number;
  cost?: number;
}

export type IWalletTransactionType = 'TOPUP' | 'CHARGE_PAYMENT' | 'REFUND';

export interface IWalletTransaction {
  id: string;
  type: IWalletTransactionType;
  amount: number;
  createdAt: string;
  description: string;
}

export interface IWallet {
  balance: number;
  currency: 'IRT';
  transactions: IWalletTransaction[];
}
