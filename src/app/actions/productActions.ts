"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProductWithCategory } from "@/types/product";

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface UpdateProductActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  product?: ProductWithCategory;
}

const productSelect = `
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
`;

// — Mark as Consumed
export async function markProductConsumed(
  productId: string,
): Promise<ActionResult> {
  try {
    if (!productId || typeof productId !== "string") {
      return { success: false, message: "Invalid product ID." };
    }

    const product = db
      .prepare("SELECT id, consumedAt, wastedAt FROM products WHERE id = ?")
      .get(productId) as
      | { id: string; consumedAt: string | null; wastedAt: string | null }
      | undefined;

    if (!product) return { success: false, message: "Product not found." };
    if (product.consumedAt) {
      return {
        success: false,
        message: "Product is already marked as consumed.",
      };
    }
    if (product.wastedAt) {
      return {
        success: false,
        message:
          "Cannot mark as consumed — this product is already marked as wasted.",
      };
    }

    const now = new Date().toISOString();
    db.prepare(
      "UPDATE products SET consumedAt = ?, updatedAt = ? WHERE id = ?",
    ).run(now, now, productId);

    revalidatePath("/");
    return { success: true, message: "Product marked as consumed." };
  } catch (error) {
    console.error("Error in markProductConsumed:", error);
    return {
      success: false,
      message: "An internal error occurred. Please try again.",
    };
  }
}

// — Mark as Wasted
export async function markProductWasted(
  productId: string,
): Promise<ActionResult> {
  try {
    if (!productId || typeof productId !== "string") {
      return { success: false, message: "Invalid product ID." };
    }

    const product = db
      .prepare("SELECT id, consumedAt, wastedAt FROM products WHERE id = ?")
      .get(productId) as
      | { id: string; consumedAt: string | null; wastedAt: string | null }
      | undefined;

    if (!product) return { success: false, message: "Product not found." };
    if (product.wastedAt) {
      return {
        success: false,
        message: "Product is already marked as wasted.",
      };
    }
    if (product.consumedAt) {
      return {
        success: false,
        message:
          "Cannot mark as wasted — this product is already marked as consumed.",
      };
    }

    const now = new Date().toISOString();
    db.prepare(
      "UPDATE products SET wastedAt = ?, updatedAt = ? WHERE id = ?",
    ).run(now, now, productId);

    revalidatePath("/");
    return { success: true, message: "Product marked as wasted." };
  } catch (error) {
    console.error("Error in markProductWasted:", error);
    return {
      success: false,
      message: "An internal error occurred. Please try again.",
    };
  }
}

// — Update Product
const updateProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
  note: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? ""),
  expirationDate: z.iso.date({
    message: "Invalid expiration date format (must be YYYY-MM-DD)",
  }),
  storageId: z.string().min(1, "Please select a storage location"),
  categoryId: z.string().min(1, "Please select a category"),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export async function updateProductAction(
  productId: string,
  rawData: unknown,
): Promise<UpdateProductActionResult> {
  try {
    if (!productId || typeof productId !== "string") {
      return { success: false, message: "Invalid product ID." };
    }

    const validated = updateProductSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed. Please correct the highlighted errors.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, quantity, note, expirationDate, storageId, categoryId } =
      validated.data;

    const existing = db
      .prepare("SELECT id FROM products WHERE id = ?")
      .get(productId);
    if (!existing) return { success: false, message: "Product not found." };

    const storageExists = db
      .prepare("SELECT id FROM storage WHERE id = ?")
      .get(storageId);
    if (!storageExists) {
      return {
        success: false,
        message: "The selected storage location does not exist.",
        errors: { storageId: ["Invalid storage location selected"] },
      };
    }

    const categoryExists = db
      .prepare("SELECT id FROM categories WHERE id = ?")
      .get(categoryId);
    if (!categoryExists) {
      return {
        success: false,
        message: "The selected category does not exist.",
        errors: { categoryId: ["Invalid category selected"] },
      };
    }

    const now = new Date().toISOString();
    db.prepare(
      `UPDATE products
       SET name = ?, quantity = ?, note = ?, expirationDate = ?,
           storageId = ?, categoryId = ?, updatedAt = ?
       WHERE id = ?`,
    ).run(
      name,
      quantity,
      note,
      expirationDate,
      storageId,
      categoryId,
      now,
      productId,
    );

    const updatedProduct = db
      .prepare(`${productSelect} WHERE p.id = ?`)
      .get(productId) as ProductWithCategory | undefined;

    revalidatePath("/");

    return {
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    };
  } catch (error) {
    console.error("Error in updateProductAction:", error);
    return {
      success: false,
      message: "An internal error occurred. Please try again.",
    };
  }
}
