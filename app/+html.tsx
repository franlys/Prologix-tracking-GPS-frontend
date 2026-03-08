import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* PWA Primary Meta Tags */}
        <meta name="application-name" content="Prologix GPS" />
        <meta name="description" content="Sistema de rastreo GPS en tiempo real para vehículos" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Prologix GPS" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/icon.png" />

        {/* iOS Splash Screens */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-startup-image" href="/assets/splash-icon.png" />

        {/* Android/Chrome */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/assets/icon.png" />
        <link rel="shortcut icon" href="/assets/icon.png" />

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="msapplication-TileImage" content="/assets/icon.png" />

        {/* Open Graph / Social */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Prologix GPS" />
        <meta property="og:description" content="Sistema de rastreo GPS en tiempo real para vehículos" />
        <meta property="og:image" content="/assets/icon.png" />

        <ScrollViewStyleReset />

        {/* PWA Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          /* Safe area for iOS notch */
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }

          /* Prevent pull-to-refresh on mobile */
          body {
            overscroll-behavior-y: contain;
          }

          /* Hide scrollbar */
          ::-webkit-scrollbar {
            display: none;
          }

          /* Smooth scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
