import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/store/providers/ReduxProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AlertProvider } from "@/components/providers/AlertProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amoli Fashion Jewellery - Premium Jewelry Online",
  description: "Premium copper and stainless steel jewelry. Nickel-free, skin-friendly, and crafted with care in Rajasthan.",
  keywords: "jewelry, fashion jewelry, copper jewelry, stainless steel jewelry, nickel-free jewelry, Rajasthan jewelry, Amoli",
  authors: [{ name: "Amoli Fashion Jewellery" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Amoli Fashion Jewellery",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
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