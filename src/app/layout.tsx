import type { Metadata, Viewport } from 'next';
import './globals.css';
import './gradient-theme.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'ProFlow - Work Tracking App',
  description: 'Manage your work, client projects, and finances efficiently.',
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='16' fill='%234F46E5'/%3E%3Cg transform='translate(6, 6)'%3E%3Cpath d='M2 4 L2 16 M2 4 L8 4 Q10 4 10 6 Q10 8 8 8 L2 8' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M12 4 L12 16 M12 4 L18 4 M12 10 L16 10' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M3 18 Q8 17 13 18 Q18 19 20 18' stroke='%2314B8A6' stroke-width='1' stroke-linecap='round' fill='none'/%3E%3C/g%3E%3C/svg%3E",
        sizes: '32x32',
        type: 'image/svg+xml'
      },
    ],
    apple: [
      {
        url: "data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='90' cy='90' r='90' fill='%234F46E5'/%3E%3Cg transform='translate(36, 36)'%3E%3Cpath d='M12 24 L12 96 M12 24 L48 24 Q60 24 60 36 Q60 48 48 48 L12 48' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M72 24 L72 96 M72 24 L108 24 M72 60 L96 60' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M18 108 Q48 102 78 108 Q108 114 120 108' stroke='%2314B8A6' stroke-width='6' stroke-linecap='round' fill='none'/%3E%3C/g%3E%3C/svg%3E",
        sizes: '180x180',
        type: 'image/svg+xml'
      },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ProFlow',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='16' fill='%234F46E5'/%3E%3Cg transform='translate(6, 6)'%3E%3Cpath d='M2 4 L2 16 M2 4 L8 4 Q10 4 10 6 Q10 8 8 8 L2 8' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M12 4 L12 16 M12 4 L18 4 M12 10 L16 10' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M3 18 Q8 17 13 18 Q18 19 20 18' stroke='%2314B8A6' stroke-width='1' stroke-linecap='round' fill='none'/%3E%3C/g%3E%3C/svg%3E" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='90' cy='90' r='90' fill='%234F46E5'/%3E%3Cg transform='translate(36, 36)'%3E%3Cpath d='M12 24 L12 96 M12 24 L48 24 Q60 24 60 36 Q60 48 48 48 L12 48' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M72 24 L72 96 M72 24 L108 24 M72 60 L96 60' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M18 108 Q48 102 78 108 Q108 114 120 108' stroke='%2314B8A6' stroke-width='6' stroke-linecap='round' fill='none'/%3E%3C/g%3E%3C/svg%3E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary showErrorDetails={process.env.NODE_ENV === 'development'}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
