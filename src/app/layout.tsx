import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { VisitTracker } from "@/components/analytics/VisitTracker";

export const metadata: Metadata = {
  title: "Affiliate Hub PH | The Kinetic Vault",
  description: "High-performance affiliate management and fintech platform.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <SessionProvider>
          <VisitTracker />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
