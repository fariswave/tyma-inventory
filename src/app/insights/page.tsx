import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights",
  description: "Analisis dan wawasan inventaris produk",
};

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Insights
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Statistik dan metrik perputaran inventaris Anda.
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
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Kerangka Halaman Insights
        </h2>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
          Statistik ringkasan dan analitik inventaris dapat diintegrasikan pada
          tahap berikutnya.
        </p>
      </div>
    </div>
  );
}
