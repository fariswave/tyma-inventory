import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tyma Inventory",
    template: "%s | Tyma Inventory",
  },
  description: "Sistem manajemen dan pelacakan inventaris produk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navigation />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
          {children}
        </main>

        <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/60 mb-16 md:mb-0">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              © 2026 Tyma Inventory. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Sistem Inventaris</span>
              <span>•</span>
              <span>Mobile-First</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
