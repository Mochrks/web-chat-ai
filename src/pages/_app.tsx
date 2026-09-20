import "@/styles/globals.css";
import "highlight.js/styles/github-dark.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider, useSession } from "next-auth/react";
import { ChatProvider } from "@/context/ChatContext";
import { LanguageProvider } from "@/context/LanguageContext";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { APP_NAME } from "@/constants/app";
import React from "react";

const AppContent = ({ Component, pageProps }: any) => {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return <Component {...pageProps} />;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <ChatProvider>
          <Head>
            <title>{APP_NAME} - Advanced AI Chat Interface</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          </Head>
          <AppContent Component={Component} pageProps={pageProps} />
        </ChatProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
