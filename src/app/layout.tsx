import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Provider";
import {Toaster} from 'react-hot-toast'
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import ThemeProviderComponent from "@/components/theme/Provider";

const inter = Inter({ subsets: ["latin"] });

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "InfoScraibe",
  description: "Chat with any PDF using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en" suppressHydrationWarning>
          <body  className={cn(
            'min-h-screen font-sans antialiased light:grainy',
            montserrat.className
          )}>
            <ThemeProviderComponent>
          <Toaster />
          <Navbar />
          {children}
          </ThemeProviderComponent>
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
