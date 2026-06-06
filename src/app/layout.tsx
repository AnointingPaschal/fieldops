import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FieldOps — Alberta Safety Control',
  description: 'Real-time field operations platform for Alberta Safety Control',
  themeColor: '#0A0C10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased">{children}</body>
    </html>
  );
}
