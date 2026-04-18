import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { VisitTracker } from "@/components/analytics/VisitTracker";

export const metadata: Metadata = {
  title: "Affiliate Hub PH | The Kinetic Vault",
  description: "High-performance affiliate management and fintech platform.",
  icons: {
    icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuAykf8gtlj5DLCqqnCdrE4eH_pYPwWtUnREwTUbotF9EZh7se7U0mXfzotMGVpFOzw8N7YmoRI06V2bFyW2GJWgfakCilJ9qV1xmuifTVWtFA0_Vv5a7tq5uS_WW2h2S3WRZi5jVqV4hALYsN7tGkBTR_-0yCZDxbvs5b1orJ5z0oBZ3IIa9VzWwpJHm9e6RL4iuqbU6t6OAolnDFK6VEPmBWb8n4aoVy0MdGr1lzvFJGuY16koa-R1-wXFZNXWldKU9D3_2Xfv498",
    shortcut:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAykf8gtlj5DLCqqnCdrE4eH_pYPwWtUnREwTUbotF9EZh7se7U0mXfzotMGVpFOzw8N7YmoRI06V2bFyW2GJWgfakCilJ9qV1xmuifTVWtFA0_Vv5a7tq5uS_WW2h2S3WRZi5jVqV4hALYsN7tGkBTR_-0yCZDxbvs5b1orJ5z0oBZ3IIa9VzWwpJHm9e6RL4iuqbU6t6OAolnDFK6VEPmBWb8n4aoVy0MdGr1lzvFJGuY16koa-R1-wXFZNXWldKU9D3_2Xfv498"
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
