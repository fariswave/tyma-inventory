export interface ProductRow {
  id: string;
  name: string;
  quantity: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  expirationDate: string;
  consumedAt: string | null;
  wastedAt: string | null;
  storageId: string;
  categoryId: string;
}
