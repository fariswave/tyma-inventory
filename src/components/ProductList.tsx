"use client";

import { useState } from "react";
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

export default function ProductList({
  initialProducts,
  categories,
  storages,
}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

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
      <ul className="flex flex-col gap-3">
        {products.map((product) => (
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
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {product.expirationDate}
                  </p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

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
