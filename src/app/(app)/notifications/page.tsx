// Placeholder — a real notification feed needs the backend to expose
// delivered-notification history, not just push subscriptions (see
// interface.push.ts). Per-branch subscriptions are toggled inline via
// NotificationBellToggle on the branch-detail page instead of here.
export default function NotificationsPage() {
  return (
    <section className="w-full flex flex-col items-center gap-sm p-lg text-center">
      <h1 className="text-lg font-semibold">اعلان‌ها</h1>
      <p className="text-sm text-muted-foreground">
        تاریخچه اعلان‌ها به‌زودی از همین صفحه در دسترس خواهد بود.
      </p>
    </section>
  );
}
