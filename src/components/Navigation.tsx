"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const navItems: NavItem[] = [
  {
    name: "My Products",
    href: "/",
    icon: ({ className }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    name: "Add Product",
    href: "/add-product",
    icon: ({ className }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    name: "Insights",
    href: "/insights",
    icon: ({ className }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: ({ className }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-zinc-900 transition-opacity hover:opacity-90 dark:text-zinc-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
                T
              </div>
              <span className="font-bold">Tyma Inventory</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden md:flex items-center gap-1.5"
              aria-label="Navigasi Utama Desktop"
            >
              {navItems.map((item) => {
                const active = isRouteActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-all ${
                      active
                        ? "bg-zinc-900 font-semibold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                        : "font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden"
        aria-label="Navigasi Bawah Mobile"
      >
        <div className="grid h-16 grid-cols-4 items-center px-1">
          {navItems.map((item) => {
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1 text-center transition-colors ${
                  active
                    ? "font-semibold text-zinc-950 dark:text-zinc-50"
                    : "font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <div
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
                    active
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] leading-tight tracking-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
