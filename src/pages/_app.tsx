import '@/styles/globals.css'
import 'highlight.js/styles/github-dark.css'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import { ChatProvider } from '@/context/ChatContext'
import LoadingScreen from '@/components/ui/LoadingScreen'
import React from 'react'

import { LanguageProvider } from '@/context/LanguageContext';

const AppContent = ({ Component, pageProps }: any) => {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return <Component {...pageProps} />;
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <ChatProvider>
          <AppContent Component={Component} pageProps={pageProps} />
        </ChatProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
