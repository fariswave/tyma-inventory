import db from "@/lib/db";
import type { ProductWithCategory } from "@/types/product";
import ProductList from "@/components/ProductList";

export const dynamic = "force-dynamic";

interface OptionItem {
  id: string;
  name: string;
}

function getProducts(): ProductWithCategory[] {
  try {
    const query = `
      SELECT
        p.id, p.name, p.quantity, p.note,
        p.createdAt, p.updatedAt, p.expirationDate,
        p.consumedAt, p.wastedAt,
        p.storageId, p.categoryId,
        c.name AS categoryName,
        s.name AS storageName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN storage s ON p.storageId = s.id
      WHERE p.consumedAt IS NULL AND p.wastedAt IS NULL
      ORDER BY p.expirationDate ASC
    `;
    return db.prepare(query).all() as ProductWithCategory[];
  } catch (error) {
    console.error("Gagal mengambil daftar produk dari database:", error);
    return [];
  }
}

function getCategories(): OptionItem[] {
  try {
    return db
      .prepare("SELECT id, name FROM categories ORDER BY name ASC")
      .all() as OptionItem[];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

function getStorages(): OptionItem[] {
  try {
    return db
      .prepare("SELECT id, name FROM storage ORDER BY name ASC")
      .all() as OptionItem[];
  } catch (error) {
    console.error("Failed to fetch storages:", error);
    return [];
  }
}

export default function MyProductsPage() {
  const products = getProducts();
  const categories = getCategories();
  const storages = getStorages();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            My Products
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            List of all inventory products with expiration dates and categories.
            Tap any card to view or edit details.
          </p>
        </div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Total: {products.length}{" "}
          {products.length === 1 ? "product" : "products"}
        </div>
      </div>

      <ProductList
        initialProducts={products}
        categories={categories}
        storages={storages}
      />
    </div>
  );
}
