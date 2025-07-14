
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AiChat from '@/components/ai/AiChat';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'StoreFront AI - Your Smart Shopping Companion',
  description: 'An AI-powered e-commerce platform with personalized discovery, smart cart suggestions, and virtual try-on features.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen flex flex-col" suppressHydrationWarning={true}>
        <AuthProvider>
          <AppProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <AiChat />
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
