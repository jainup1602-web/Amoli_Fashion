import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/store/providers/ReduxProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AlertProvider } from "@/components/providers/AlertProvider";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amoli Fashion Jewellery - Premium Demi-Fine Jewellery",
  description: "Premium demi-fine copper and stainless steel jewellery. Nickel-free, skin-friendly, and crafted with care in Rajasthan.",
  keywords: "jewellery, demi-fine jewellery, fashion jewellery, copper jewellery, stainless steel jewellery, nickel-free jewellery, Rajasthan jewellery, Amoli",
  authors: [{ name: "Amoli Fashion Jewellery" }],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Amoli Fashion Jewellery",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A1A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.variable} font-sans overflow-x-hidden`} suppressHydrationWarning>
        <ReduxProvider>
          <AlertProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AlertProvider>
        </ReduxProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}