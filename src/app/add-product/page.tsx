import type { Metadata } from "next";
import db from "@/lib/db";
import AddProductForm from "./AddProductForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Product",
  description: "Add a new product to your inventory",
};

interface OptionItem {
  id: string;
  name: string;
}

function getCategories(): OptionItem[] {
  try {
    return db
      .prepare("SELECT id, name FROM categories ORDER BY name ASC")
      .all() as OptionItem[];
  } catch (error) {
    console.error("Failed to fetch categories from database:", error);
    return [];
  }
}

function getStorages(): OptionItem[] {
  try {
    return db
      .prepare("SELECT id, name FROM storage ORDER BY name ASC")
      .all() as OptionItem[];
  } catch (error) {
    console.error("Failed to fetch storage locations from database:", error);
    return [];
  }
}

export default function AddProductPage() {
  const categories = getCategories();
  const storages = getStorages();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Add Product
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter the details below to add and track a new product in your
          inventory.
        </p>
      </div>

      {/* Product Form */}
      <AddProductForm categories={categories} storages={storages} />
    </div>
  );
}
