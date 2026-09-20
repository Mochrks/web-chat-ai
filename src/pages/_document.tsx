import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        {/* ─── Preconnect & Fonts ─── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ─── Core Meta ─── */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#08090d" />
        <meta name="color-scheme" content="dark" />

        {/* ─── SEO Meta ─── */}
        <meta
          name="description"
          content="Pied AI - an advanced AI chat interface powered by Google Gemini. Chat with multiple AI models, switch roles, upload images, and use voice input. Built for developers and creative professionals."
        />
        <meta
          name="keywords"
          content="Pied AI, AI chat, Google Gemini, Gemini 2.5 Flash, AI assistant, developer tools, fullstack AI, Next.js AI, conversational AI, voice AI, image analysis AI"
        />
        <meta name="author" content="Mochrks" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="generator" content="Next.js" />
        <meta name="application-name" content="Pied AI" />

        {/* ─── Open Graph / Facebook ─── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Pied AI" />
        <meta property="og:title" content="Pied AI - Advanced AI Chat Interface" />
        <meta
          property="og:description"
          content="Chat with Google Gemini AI models, switch expert roles, upload images, and use voice input. A modern AI interface built for developers."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Pied AI - Advanced AI Chat Interface" />
        <meta property="og:locale" content="en_US" />

        {/* ─── Twitter Card ─── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pied AI - Advanced AI Chat Interface" />
        <meta
          name="twitter:description"
          content="Chat with Google Gemini AI models, switch expert roles, upload images, and use voice input."
        />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:image:alt" content="Pied AI" />
        <meta name="twitter:creator" content="@Mochrks" />
        <meta name="twitter:site" content="@Mochrks" />

        {/* ─── PWA / Mobile ─── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pied AI" />
        <meta name="format-detection" content="telephone=no" />

        {/* ─── Icons / Favicon ─── */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* ─── Structured Data (JSON-LD) ─── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pied AI",
              description:
                "An advanced AI chat interface powered by Google Gemini. Chat with multiple AI models, switch expert roles, upload images, and use voice input.",
              url: "https://pied-ai.vercel.app",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              author: {
                "@type": "Person",
                name: "Mochrks",
                url: "https://github.com/Mochrks",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Multi-model Google Gemini support",
                "Role-based AI responses",
                "Image upload and analysis",
                "Voice input",
                "Chat history",
                "Dark mode UI",
                "Markdown rendering",
                "Code highlighting",
              ],
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
