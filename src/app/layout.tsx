import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FieldOps — Alberta Safety Control',
  description: 'Real-time field operations platform for Alberta Safety Control',
  themeColor: '#0A0C10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-white antialiased">{children}</body>
    </html>
  );
}
