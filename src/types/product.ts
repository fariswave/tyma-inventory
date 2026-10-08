export interface ProductWithCategory {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  expirationDate: string;
  consumedAt: string | null;
  wastedAt: string | null;
  storageId: string;
  categoryId: string;
  categoryName?: string | null; // ← dari LEFT JOIN categories
  storageName?: string | null; // ← dari LEFT JOIN storage
}
