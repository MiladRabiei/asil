'use client';

import { useGetBranch } from '@/shared/_service/hook.query';
import withFallback from '@/hoc/withFallback';
import BranchDetail from './BranchDetail';
import type { IChargingBranch } from '@/shared/_service/interface.ev';

interface BranchDetailContentProps {
  data?: IChargingBranch;
}

const BranchDetailContent: React.FC<BranchDetailContentProps> = ({ data }) =>
  data ? <BranchDetail branch={data} /> : null;

const BranchDetailWithFallback = withFallback(BranchDetailContent);

export default function BranchDetailContainer({ branchId }: { branchId: string }) {
  const { data: branch, isLoading } = useGetBranch(branchId);

  return (
    <BranchDetailWithFallback
      data={branch}
      isLoading={isLoading}
      notFoundMessage="این ایستگاه یافت نشد"
    />
  );
}
