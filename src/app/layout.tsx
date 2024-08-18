import { NEXT_PUBLIC_URL } from '../config';
import OnchainProviders from '../components/OnchainProviders';
import type { Metadata } from 'next';
import { AppKit } from '../context/web3modal'
import './global.css';
import '@coinbase/onchainkit/styles.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: 'OnchainSweeper',
  description: 'Reveal mines on the blockchain and level up.',
  openGraph: {
    title: 'OnchainSweeper',
    description: 'Reveal mines on the blockchain and level up.',
    images: [`${NEXT_PUBLIC_URL}/vibes/vibes-19.png`],
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center">
        <AppKit>{children}</AppKit>
      </body>
    </html>
  );
}
