import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Selet (ስሌት) — Software Cost Estimation & Pricing',
  description: 'Open-source cost estimation and pricing tool for software companies in Ethiopia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
