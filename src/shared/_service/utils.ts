// import { IClientAddressType, IPaymentScenarioType } from '@/shared/_service/interface.schema';
// export const resolvePaymentScenario = (
//   paymentId: string | null,
//   paymentStatus: string | null | undefined,
//   paymentLoaded: boolean
// ): IPaymentScenarioType => {
//   if (!paymentId || isNaN(Number(paymentId))) return 'invalid';
//   if (Number(paymentId) === -1) return 'backend-error';
//   if (paymentLoaded && paymentStatus === undefined) return 'invalid';
//   if (!paymentLoaded) return 'failed';
//   return paymentStatus?.toLowerCase() === 'success' ? 'success' : 'failed';
// };
// export const buildAddressTitle = (addr: IClientAddressType): string =>
//   [
//     addr.city.province.name,
//     addr.city.name,
//     addr.number
//       ? `پلاک ${Number(addr.number).toLocaleString('fa-IR', { useGrouping: false })}`
//       : null,
//     addr.unit ? `واحد ${Number(addr.unit).toLocaleString('fa-IR', { useGrouping: false })}` : null,
//   ]
//     .filter(Boolean)
//     .join('، ');
