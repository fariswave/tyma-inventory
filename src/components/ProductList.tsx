"use client";

import { useMemo, useState } from "react";
import type { ProductWithCategory } from "@/types/product";
import ProductDetailModal from "./ProductDetailModal";

interface OptionItem {
  id: string;
  name: string;
}

interface ProductListProps {
  initialProducts: ProductWithCategory[];
  categories: OptionItem[];
  storages: OptionItem[];
}

type StatusFilter = "all" | "expired" | "today" | "thisWeek";

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
  const weekday = (today.getDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - weekday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    today: toLocalDate(today),
    weekStart: toLocalDate(weekStart),
    weekEnd: toLocalDate(weekEnd),
  };
}

export default function ProductList({
  initialProducts,
  categories,
  storages,
}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Ambil versi terbaru dari list (bukan snapshot lama saat klik)
  const selectedProduct =
    products.find((p) => p.id === selectedProductId) ?? null;

  const handleProductUpdated = (updated: ProductWithCategory) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    );
  };

  // Produk consumed/wasted dikeluarkan dari list.
  // selectedProduct otomatis jadi null → modal ikut tertutup.
  const handleProductRemoved = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /* ---------------------------------------------------------------- */
  /* Combined filtering: search + category + status                    */
  /* ---------------------------------------------------------------- */

  const { today, weekEnd } = useMemo(() => getDateWindows(), []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      // Search by name (case-insensitive substring match)
      if (query && !product.name.toLowerCase().includes(query)) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && product.categoryId !== categoryFilter) {
        return false;
      }

      // Status filters (based on expiration date)
      if (statusFilter !== "all") {
        const exp = product.expirationDate;
        switch (statusFilter) {
          case "expired":
            if (exp >= today) return false;
            break;
          case "today":
            if (exp !== today) return false;
            break;
          case "thisWeek":
            // Already expired is excluded; must fall within this week (today included)
            if (exp < today || exp > weekEnd) return false;
            break;
        }
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter, today, weekEnd]);

  const isFiltering =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  /* Per-status counts (independent of the status filter, based on full list) */
  const statusCounts = useMemo(() => {
    let expired = 0;
    let expiresToday = 0;
    let expiresThisWeek = 0;

    for (const product of products) {
      const exp = product.expirationDate;
      if (exp < today) {
        expired += 1;
      } else if (exp === today) {
        expiresToday += 1;
      } else if (exp <= weekEnd) {
        expiresThisWeek += 1;
      }
    }

    return { expired, expiresToday, expiresThisWeek };
  }, [products, today, weekEnd]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          No products yet. Add your first product to start tracking.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ---------------- Search & Filters ---------------- */}
      <div className="flex flex-col gap-3">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name..."
            aria-label="Search products by name"
            className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
          />
        </div>

        {/* Category quick filters (horizontal scroll, single line) */}
        <div className="relative -mx-1 px-1">
          <div className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                categoryFilter === "all"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) =>
                    prev === category.id ? "all" : category.id,
                  )
                }
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  categoryFilter === category.id
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          {/* Fade edge hinting more content to the right */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
        </div>

        {/* Status quick filters (single line, colored, with counts) */}
        <div className="relative -mx-1 px-1">
          <div className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Expiration:
            </span>

            {/* All */}
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === "all"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              All
            </button>

            {/* Expired – red */}
            <button
              type="button"
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "expired" ? "all" : "expired",
                )
              }
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === "expired"
                  ? "border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500 dark:text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-rose-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-rose-700"
              }`}
            >
              Expired
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  statusFilter === "expired"
                    ? "bg-white/20 text-white"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                }`}
              >
                {statusCounts.expired}
              </span>
            </button>

            {/* Expires Today – amber */}
            <button
              type="button"
              onClick={() =>
                setStatusFilter((prev) => (prev === "today" ? "all" : "today"))
              }
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === "today"
                  ? "border-amber-600 bg-amber-500 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-amber-700"
              }`}
            >
              Today
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  statusFilter === "today"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                }`}
              >
                {statusCounts.expiresToday}
              </span>
            </button>

            {/* Expires This Week – emerald */}
            <button
              type="button"
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "thisWeek" ? "all" : "thisWeek",
                )
              }
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === "thisWeek"
                  ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-700"
              }`}
            >
              This Week
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  statusFilter === "thisWeek"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                }`}
              >
                {statusCounts.expiresThisWeek}
              </span>
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
        </div>

        {/* Active filter summary + reset */}
        {isFiltering && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Showing {filteredProducts.length} of {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ---------------- Product list ---------------- */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No products match your search or filters.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-3 text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredProducts.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-zinc-900 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {product.categoryName ?? "No category"} ·{" "}
                      {product.storageName ?? "No storage"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Qty {product.quantity}
                    </p>
                    <p
                      className={`mt-0.5 text-xs font-medium ${
                        product.expirationDate < today
                          ? "text-rose-600 dark:text-rose-400"
                          : product.expirationDate === today
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {product.expirationDate}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id} // ← penting: reset form saat ganti produk
          product={selectedProduct}
          categories={categories}
          storages={storages}
          onClose={() => setSelectedProductId(null)}
          onProductUpdated={handleProductUpdated}
          onProductRemoved={handleProductRemoved}
        />
      )}
    </>
  );
}
