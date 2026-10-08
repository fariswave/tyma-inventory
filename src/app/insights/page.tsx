import type { Metadata } from "next";
import db from "@/lib/db";

export const metadata: Metadata = {
  title: "Insights",
  description: "Inventory analytics, usage efficiency, and expiration insights",
};

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CategoryCount {
  name: string;
  count: number;
}

interface InsightsData {
  totalProducts: number;
  categories: CategoryCount[];
  consumedTotal: number;
  wastedTotal: number;
  consumedAfterExpiration: number;
  totalExpired: number;
  expiredThisWeek: number;
  expiredThisMonth: number;
  weekStart: string;
  weekEnd: string;
  monthStart: string;
  monthEnd: string;
}

/* ------------------------------------------------------------------ */
/* Date helpers (local time, YYYY-MM-DD strings)                       */
/* ------------------------------------------------------------------ */

function toLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateWindows() {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Monday-based week
  const weekday = (now.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - weekday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    today: toLocalDate(today),
    weekStart: toLocalDate(weekStart),
    weekEnd: toLocalDate(weekEnd),
    monthStart: toLocalDate(monthStart),
    monthEnd: toLocalDate(monthEnd),
  };
}

/* ------------------------------------------------------------------ */
/* Data fetching (same pattern as src/app/page.tsx)                    */
/* ------------------------------------------------------------------ */

function getInsights(): InsightsData {
  const { today, weekStart, weekEnd, monthStart, monthEnd } = getDateWindows();

  const activeFilter = "consumedAt IS NULL AND wastedAt IS NULL";

  try {
    const totalProducts = (
      db
        .prepare(`SELECT COUNT(*) AS count FROM products WHERE ${activeFilter}`)
        .get() as { count: number }
    ).count;

    const categories = db
      .prepare(
        `
        SELECT
          c.name AS name,
          COUNT(p.id) AS count
        FROM categories c
        LEFT JOIN products p
          ON p.categoryId = c.id
          AND p.consumedAt IS NULL
          AND p.wastedAt IS NULL
        GROUP BY c.id
        ORDER BY count DESC, c.name ASC
      `,
      )
      .all() as CategoryCount[];

    const consumedTotal = (
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM products WHERE consumedAt IS NOT NULL",
        )
        .get() as { count: number }
    ).count;

    const wastedTotal = (
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM products WHERE wastedAt IS NOT NULL",
        )
        .get() as { count: number }
    ).count;

    const consumedAfterExpiration = (
      db
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM products
          WHERE consumedAt IS NOT NULL
            AND consumedAt > expirationDate
        `,
        )
        .get() as { count: number }
    ).count;

    const totalExpired = (
      db
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM products
          WHERE ${activeFilter}
            AND expirationDate < ?
        `,
        )
        .get(today) as { count: number }
    ).count;

    const expiredThisWeek = (
      db
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM products
          WHERE ${activeFilter}
            AND expirationDate >= ?
            AND expirationDate <= ?
            AND expirationDate < ?
        `,
        )
        .get(weekStart, weekEnd, today) as { count: number }
    ).count;

    const expiredThisMonth = (
      db
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM products
          WHERE ${activeFilter}
            AND expirationDate >= ?
            AND expirationDate <= ?
            AND expirationDate < ?
        `,
        )
        .get(monthStart, monthEnd, today) as { count: number }
    ).count;

    return {
      totalProducts,
      categories,
      consumedTotal,
      wastedTotal,
      consumedAfterExpiration,
      totalExpired,
      expiredThisWeek,
      expiredThisMonth,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
    };
  } catch (error) {
    console.error("Failed to fetch insights data:", error);
    return {
      totalProducts: 0,
      categories: [],
      consumedTotal: 0,
      wastedTotal: 0,
      consumedAfterExpiration: 0,
      totalExpired: 0,
      expiredThisWeek: 0,
      expiredThisMonth: 0,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "danger" | "warning" | "success";
}) {
  const accentClasses: Record<string, string> = {
    default: "text-zinc-900 dark:text-zinc-50",
    danger: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold ${accentClasses[accent ?? "default"]}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

function DonutChart({
  consumed,
  wasted,
}: {
  consumed: number;
  wasted: number;
}) {
  const total = consumed + wasted;
  const efficiency = total > 0 ? Math.round((consumed / total) * 100) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const consumedLength = total > 0 ? (consumed / total) * circumference : 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="16"
          className="stroke-zinc-200 dark:stroke-zinc-700"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="16"
          stroke="currentColor"
          className="text-emerald-500"
          strokeDasharray={`${consumedLength} ${circumference - consumedLength}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className="fill-zinc-900 text-xl font-bold dark:fill-zinc-50"
        >
          {efficiency}%
        </text>
        <text
          x="70"
          y="84"
          textAnchor="middle"
          className="fill-zinc-500 text-[10px] font-medium dark:fill-zinc-400"
        >
          Efficiency
        </text>
      </svg>

      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            Consumed
          </span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {consumed}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            Wasted
          </span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {wasted}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {total === 0
            ? "No usage recorded yet."
            : `${consumed} of ${total} used products were consumed before expiring.`}
        </p>
      </div>
    </div>
  );
}

function CategoryBars({ categories }: { categories: CategoryCount[] }) {
  const max = Math.max(...categories.map((c) => c.count), 1);
  const palette = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-fuchsia-500",
  ];

  if (categories.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No categories available yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {categories.map((category, index) => (
        <li key={category.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              {category.name}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {category.count}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full ${palette[index % palette.length]}`}
              style={{ width: `${Math.max((category.count / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExpirationBars({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {data.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-800"
        >
          <div className="flex h-28 w-full items-end justify-center">
            <div
              className={`w-10 rounded-t-lg ${item.color}`}
              style={{ height: `${Math.max((item.value / max) * 100, 6)}%` }}
            />
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {item.value}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function InsightsPage() {
  const data = getInsights();

  const consumedVsWasted = [
    { label: "Consumed", value: data.consumedTotal, color: "bg-emerald-500" },
    { label: "Wasted", value: data.wastedTotal, color: "bg-rose-400" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Insights
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Overview of your inventory, usage, and expiration trends.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={data.totalProducts}
          hint="Currently active in inventory"
        />
        <StatCard
          label="Total Consumed"
          value={data.consumedTotal}
          hint="Products consumed to date"
          accent="success"
        />
        <StatCard
          label="Total Expired"
          value={data.totalExpired}
          hint="Active products past expiration"
          accent="danger"
        />
        <StatCard
          label="Consumed After Expiration"
          value={data.consumedAfterExpiration}
          hint="Used after the expiration date"
          accent="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Usage efficiency */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Usage Efficiency
          </h2>
          <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-400">
            Consumed vs. wasted products
          </p>
          <DonutChart consumed={data.consumedTotal} wasted={data.wastedTotal} />
        </section>

        {/* Products by category */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Products by Category
          </h2>
          <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-400">
            Active inventory grouped by category
          </p>
          <CategoryBars categories={data.categories} />
        </section>
      </div>

      {/* Expiration timeline */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Expiration Timeline
        </h2>
        <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-400">
          Expired products grouped by date range ({data.weekStart} to{" "}
          {data.weekEnd} this week, {data.monthStart} to {data.monthEnd} this
          month)
        </p>
        <ExpirationBars
          data={[
            {
              label: "Expired This Week",
              value: data.expiredThisWeek,
              color: "bg-amber-500",
            },
            {
              label: "Expired This Month",
              value: data.expiredThisMonth,
              color: "bg-orange-500",
            },
            {
              label: "Total Expired",
              value: data.totalExpired,
              color: "bg-rose-500",
            },
            {
              label: "Consumed After Expiration",
              value: data.consumedAfterExpiration,
              color: "bg-zinc-400",
            },
          ]}
        />
      </section>

      {/* Consumed vs wasted summary strip */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Consumed vs. Wasted
        </h2>
        <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-400">
          Lifetime totals across all removed products
        </p>
        <div className="flex flex-col gap-4">
          {consumedVsWasted.map((item) => {
            const total =
              data.consumedTotal + data.wastedTotal > 0
                ? data.consumedTotal + data.wastedTotal
                : 1;
            return (
              <div key={item.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">
                    {item.label}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {item.value}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${Math.max((item.value / total) * 100, 2)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
