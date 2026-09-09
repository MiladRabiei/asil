import { Badge } from '@/components/ui/badge';

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  showDivider?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, highlight, showDivider = true }) => (
  <div className="flex items-center justify-between text-xs lg:text-sm">
    <span className="font-medium text-muted-foreground">{label}</span>

    {showDivider && (
      <span className="mx-2 flex-1 border-b border-dotted border-muted-foreground/40" />
    )}

    {highlight ? (
      <Badge className="border-0 bg-blue-50 text-blue-500">{value}</Badge>
    ) : (
      <span className="text-muted-foreground lg:font-semibold">{value}</span>
    )}
  </div>
);

export default DetailRow;
