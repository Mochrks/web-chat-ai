import '@/styles/globals.css'
import 'highlight.js/styles/github-dark.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { ChatProvider } from '@/context/ChatContext'

import { LanguageProvider } from '@/context/LanguageContext';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <ChatProvider>
          <Component {...pageProps} />
        </ChatProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
