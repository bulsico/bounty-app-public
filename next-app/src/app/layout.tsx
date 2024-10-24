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
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Aptos Bounties",
  description: "Aptos Bounties",
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
              <SidebarProvider>
                <div className="flex flex-col w-full h-screen overflow-hidden">
                  <WrongNetworkAlert />
                  <Toaster />
                  <header className="flex-shrink-0 h-15 py-6 px-3 border-b bg-white dark:bg-black z-10">
                    <RootHeader />
                  </header>
                  <div className="flex flex-1 overflow-hidden">
                    <AppSidebar />
                    <main className="flex-grow overflow-hidden relative">
                      <div className="absolute inset-0 h-full overflow-y-auto overscroll-contain">
                        <div className="min-h-full p-4">{children}</div>
                      </div>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </WalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
