import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1, "Input your product name"),
  quantity: z.int(),
  note: z.string(),
  expirationDate: z.iso.date(),
  storageId: z.string().min(1),
  categoryId: z.string().min(1),
});
