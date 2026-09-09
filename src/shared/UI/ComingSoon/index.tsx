interface ComingSoonProps {
  title?: string;
}

// Stand-in for any page/role-variant whose real content hasn't been designed
// yet. Swap the call site to the real component once it exists — nothing
// else needs to change.
const ComingSoon: React.FC<ComingSoonProps> = ({ title = 'این بخش به‌زودی تکمیل می‌شود' }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <p className="text-base font-medium">{title}</p>
    </div>
  );
};

export default ComingSoon;
