import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Selet (ስሌት) — Software Cost Estimation & Pricing',
  description: 'Open-source cost estimation and pricing tool for software companies in Ethiopia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#fafafa] transition-colors duration-150 antialiased selection:bg-[#007a55]/20 dark:selection:bg-[#5ee9b5]/20">
        {children}
      </body>
    </html>
  );
}

