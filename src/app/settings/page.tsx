import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Pengaturan aplikasi Tyma Inventory",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Konfigurasi dan preferensi sistem inventaris.
        </p>
      </div>

      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/20 sm:min-h-[380px]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Kerangka Halaman Settings
        </h2>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
          Pengaturan aplikasi dan konfigurasi sistem dapat diintegrasikan pada
          tahap berikutnya.
        </p>
      </div>
    </div>
  );
}
