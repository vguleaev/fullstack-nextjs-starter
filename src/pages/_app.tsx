import '@/styles/globals.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Notification from '@/components/notification';
import { Roboto } from 'next/font/google';

const robot = Roboto({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'] });

export default function App({ Component, pageProps }: AppProps) {
  const session = pageProps.session;

  return (
    <SessionProvider session={session}>
      <Head>
        <title>Nextjs App</title>
        <meta name="description" content="Fullstack NextJs project starter" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`bg-base-100" ${robot.className}`}>
        <Notification />
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
