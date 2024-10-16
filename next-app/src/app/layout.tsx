import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { PropsWithChildren } from "react";
import { RootHeader } from "@/components/RootHeader";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { RootSidebar } from "@/components/RootSidebar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bounty App",
  description: "Bounty App",
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex justify-center bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <WalletProvider>
              <div className="flex flex-col w-full h-screen overflow-hidden">
                <header className="flex-shrink-0 h-15 py-6 px-3 border-b bg-white dark:bg-black z-10">
                  <RootHeader />
                </header>
                <WrongNetworkAlert />
                <Toaster />
                <div className="flex flex-1 overflow-hidden">
                  <aside className="hidden sm:block w-64 flex-shrink-0 p-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
                    <RootSidebar />
                  </aside>
                  <main className="flex-grow overflow-hidden relative">
                    <div className="absolute inset-0 h-full overflow-y-auto overscroll-contain">
                      <div className="min-h-full p-4">{children}</div>
                    </div>
                  </main>
                </div>
              </div>
            </WalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;