import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPSC PYQ Revision",
  description: "Revision is the only strategy. Practice and analyze UPSC CSE Prelims PYQs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex flex-1 flex-col w-full h-full min-h-screen bg-white dark:bg-[#212121]">
                <header className="flex h-14 items-center gap-4 px-4 shrink-0">
                   <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                   <h1 className="text-sm font-semibold truncate lg:hidden">UPSC PYQ Revision</h1>
                </header>
                <div className="flex-1 overflow-auto">
                  <div className="max-w-4xl mx-auto w-full h-full">
                    {children}
                  </div>
                </div>
              </main>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
