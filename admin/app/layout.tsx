import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/store/providers/ReduxProvider";
import { AlertProvider } from "@/components/providers/AlertProvider";

export const metadata: Metadata = {
  title: "Amoli Admin Panel",
  description: "Admin dashboard for Amoli Fashion Jewellery",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <ReduxProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </ReduxProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
