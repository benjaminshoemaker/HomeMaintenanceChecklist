// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';

import { FastPrAnalytics } from '../components/fast-pr-analytics';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Seasonal Home Checklist',
  description: 'Quarterly home maintenance, personalized by ZIP and features',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}      <FastPrAnalytics />
</body>
    </html>
  );
}
