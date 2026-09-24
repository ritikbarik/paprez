import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PAPrez — Smart Printing Simplified',
  description: 'PAPrez connects customers, print shops, and delivery agents with streamlined order workflow.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
