import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import '@/globals.css';
import ClientApolloProvider from '@/lib/apollo/ClientApolloProvider';
import { NotificationProvider } from '@/lib/notification/NotificationProvider';
import { PwaProvider } from '@/lib/pwa';
import QueryProvider from '@/lib/QueryProvider';
import type { Metadata, Viewport } from 'next';

// "Asil" — matches the reference product design (⚡ Asil). Note: an earlier
// infra spike's manifest used "شارژینو" instead — confirm the final brand
// name officially before shipping; this is just the one place to change it.
export const metadata: Metadata = {
  title: 'Asil',
  description: 'یافتن ایستگاه شارژ خودرو برقی، مسیریابی و پرداخت از کیف پول',
  // iOS reads these two directly, not from manifest.ts — Safari's manifest
  // icon support is unreliable for the home-screen icon specifically.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Asil',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

// viewport-fit=cover + safe-area-inset-* in CSS is what keeps fixed
// headers/footers (map controls, bottom nav) from sitting under the iPhone
// notch/home-indicator once the app is installed to the home screen.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" data-theme="mytheme" dir="rtl" className="scroll-smooth">
      <body>
        <ClientApolloProvider>
          <QueryProvider>
            <PwaProvider>
              <AuthProvider>
                <UserProvider>
                  <NotificationProvider>
                    <main className="w-full min-h-dvh">{children}</main>
                    {/* Soft-ask banners — both read their own visibility state and
                        render nothing when not applicable, safe to always mount here. */}
                    {/* <InstallPrompt /> */}
                    {/* <PushNotificationGate /> */}
                  </NotificationProvider>
                </UserProvider>
              </AuthProvider>
            </PwaProvider>
          </QueryProvider>
        </ClientApolloProvider>
      </body>
    </html>
  );
}
