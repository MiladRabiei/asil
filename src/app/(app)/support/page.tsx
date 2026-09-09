// Placeholder — hook up to a real support channel (ticket form, chat
// widget, phone number) once that's decided. Kept as its own route since
// it's already a bottom-nav destination.
export default function SupportPage() {
  return (
    <section className="w-full flex flex-col items-center gap-sm p-lg text-center">
      <h1 className="text-lg font-semibold">پشتیبانی</h1>
      <p className="text-sm text-muted-foreground">
        برای ارتباط با پشتیبانی، به‌زودی از همین صفحه امکان گفتگو یا تماس فراهم می‌شود.
      </p>
    </section>
  );
}
