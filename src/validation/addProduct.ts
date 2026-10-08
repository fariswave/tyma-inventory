import { z } from "zod";

export const addProductSchema = z.object({
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
  expirationDate: z
    .string()
    .min(1, "Expiration date is required")
    .and(
      z.iso.date({
        message: "Invalid expiration date format (must be YYYY-MM-DD)",
      }),
    ),
  storageId: z.string().min(1, "Please select a storage location"),
  categoryId: z.string().min(1, "Please select a category"),
});

export type AddProductInput = z.infer<typeof addProductSchema>;
