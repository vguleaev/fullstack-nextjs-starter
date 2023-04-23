import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Notification from '@/components/notification';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] });

export default function App({ Component, pageProps }: AppProps) {
  const session = pageProps.session;

  return (
    <SessionProvider session={session}>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
      <Notification />
    </SessionProvider>
  );
}