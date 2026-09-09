import BranchDetailContainer from './_components/BranchDetailContainer';

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  return <BranchDetailContainer branchId={branchId} />;
}
