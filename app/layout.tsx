import type { Metadata } from 'next';
import './globals.css';
import { DemoProvider } from '@/lib/safety-engine/demo-controller';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DemoControllerBar } from '@/components/demo/DemoControllerBar';

export const metadata: Metadata = {
  title: 'WalkSafe — Never Walk Alone',
  description:
    'WalkSafe is a proactive personal safety web platform for safer routes, monitored journeys, trusted connections, and intelligent escalation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="text-slate-100 min-h-screen flex flex-col antialiased">
        <DemoProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <DemoControllerBar />
        </DemoProvider>
      </body>
    </html>
  );
}
