import type { Metadata } from 'next';
import './globals.css';
import NavigationProgress from '@/components/ui/NavigationProgress';
import DiscrepancyFAB from '@/components/ui/DiscrepancyFAB';

export const metadata: Metadata = {
  title: 'FieldOps — Alberta Safety Control',
  description: 'Field operations management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        <NavigationProgress />
        <DiscrepancyFAB />
        {children}
      </body>
    </html>
  );
}
