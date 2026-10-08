"use server";

import db from "@/lib/db";
import { randomUUID } from "node:crypto";
import { addProductSchema } from "@/validation/addProduct";
import { revalidatePath } from "next/cache";

export interface CreateProductResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function createProductAction(
  rawData: unknown,
): Promise<CreateProductResult> {
  try {
    const validated = addProductSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed. Please correct the highlighted errors.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, quantity, note, expirationDate, storageId, categoryId } =
      validated.data;

    // Verify storageId exists in database
    const storageExists = db
      .prepare("SELECT id FROM storage WHERE id = ?")
      .get(storageId);
    if (!storageExists) {
      return {
        success: false,
        message:
          "The selected storage location does not exist in the database.",
        errors: { storageId: ["Invalid storage location selected"] },
      };
    }

    // Verify categoryId exists in database
    const categoryExists = db
      .prepare("SELECT id FROM categories WHERE id = ?")
      .get(categoryId);
    if (!categoryExists) {
      return {
        success: false,
        message: "The selected category does not exist in the database.",
        errors: { categoryId: ["Invalid category selected"] },
      };
    }

    const id = randomUUID();
    const insertStmt = db.prepare(
      `INSERT INTO products (
        id, name, quantity, note, expirationDate, storageId, categoryId
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    insertStmt.run(
      id,
      name,
      quantity,
      note,
      expirationDate,
      storageId,
      categoryId,
    );

    try {
      revalidatePath("/");
      revalidatePath("/add-product");
    } catch {
      // Safe fallback when executed outside Next.js request context (e.g., automated tests)
    }

    return {
      success: true,
      message: "Product successfully added to inventory!",
    };
  } catch (error) {
    console.error("Error in createProductAction:", error);
    return {
      success: false,
      message: "An internal server error occurred while saving the product.",
    };
  }
}
