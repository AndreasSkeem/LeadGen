/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/DemoBanner";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "Findli - Guided moving guide",
  description:
    "Plan your move through a guided intake and compare matched moving companies across Scandinavia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-gray-700 antialiased">
        <LanguageProvider>
          <DemoBanner />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
