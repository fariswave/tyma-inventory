"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import type { ProductWithCategory } from "@/types/product";
import {
  markProductConsumed,
  markProductWasted,
  updateProductAction,
  type UpdateProductInput,
} from "@/app/actions/productActions";

interface OptionItem {
  id: string;
  name: string;
}

interface ProductDetailModalProps {
  product: ProductWithCategory;
  categories: OptionItem[];
  storages: OptionItem[];
  onClose: () => void;
  onProductUpdated: (updated: ProductWithCategory) => void;
  onProductRemoved: (id: string) => void;
}

// — Helpers
function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// — Zod schema (sama dengan server)
const editSchema = z.object({
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
    message: "Invalid date format (YYYY-MM-DD)",
  }),
  storageId: z.string().min(1, "Please select a storage location"),
  categoryId: z.string().min(1, "Please select a category"),
});

const editResolver: Resolver<UpdateProductInput> = async (values) => {
  const result = editSchema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };

  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] || "");
    if (field && !errors[field]) {
      errors[field] = { type: issue.code, message: issue.message };
    }
  }
  return {
    values: {} as UpdateProductInput,
    errors: errors as unknown as Parameters<
      typeof editResolver
    >[0] extends UpdateProductInput
      ? never
      : Record<string, { type: string; message: string }>,
  };
};

// — Modal Component
export default function ProductDetailModal({
  product,
  categories,
  storages,
  onClose,
  onProductUpdated,
  onProductRemoved,
}: ProductDetailModalProps) {
  const [currentProduct, setCurrentProduct] = useState(product);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const isConsumed = !!currentProduct.consumedAt;
  const isWasted = !!currentProduct.wastedAt;

  // — Form: langsung editable, TANPA mode toggle
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProductInput>({
    resolver: editResolver,
    defaultValues: {
      name: product.name,
      quantity: product.quantity,
      note: product.note ?? "",
      expirationDate: product.expirationDate,
      storageId: product.storageId,
      categoryId: product.categoryId,
    },
  });

  // — Save handler
  const onSave = async (data: UpdateProductInput) => {
    setActionError(null);
    setActionSuccess(null);

    const result = await updateProductAction(currentProduct.id, data);

    if (!result.success) {
      setActionError(result.message);
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            setError(field as keyof UpdateProductInput, {
              type: "server",
              message: messages[0],
            });
          }
        });
      }
      return;
    }

    if (result.product) {
      setCurrentProduct(result.product);
      onProductUpdated(result.product);
    }
    setActionSuccess("Product updated successfully.");
  };

  // — Mark handlers: setelah sukses, produk dikeluarkan dari list
  const handleMarkConsumed = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsActioning(true);
    const result = await markProductConsumed(currentProduct.id);
    setIsActioning(false);
    if (!result.success) {
      setActionError(result.message);
      return;
    }
    onProductRemoved(currentProduct.id); // hapus dari list & tutup modal
  };

  const handleMarkWasted = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsActioning(true);
    const result = await markProductWasted(currentProduct.id);
    setIsActioning(false);
    if (!result.success) {
      setActionError(result.message);
      return;
    }
    onProductRemoved(currentProduct.id); // hapus dari list & tutup modal
  };

  // — Backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
        : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
    }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product details"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Panel */}
      <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex-1 pr-8">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Product Details
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-zinc-900 line-clamp-2 dark:text-zinc-50">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Scrollable body: FORM LANGSUNG EDITABLE */}
        <form
          id="product-form"
          onSubmit={handleSubmit(onSave)}
          noValidate
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
        >
          {/* Status banners */}
          {actionError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-4 w-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{actionError}</span>
            </div>
          )}
          {actionSuccess && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-4 w-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Product Name *
            </label>
            <input
              id="edit-name"
              type="text"
              {...register("name")}
              className={`mt-1.5 ${inputClass(!!errors.name)}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Category & Storage */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-category"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Category *
              </label>
              <select
                id="edit-category"
                {...register("categoryId")}
                className={`mt-1.5 ${inputClass(!!errors.categoryId)}`}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="edit-storage"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Storage *
              </label>
              <select
                id="edit-storage"
                {...register("storageId")}
                className={`mt-1.5 ${inputClass(!!errors.storageId)}`}
              >
                <option value="">Select storage</option>
                {storages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.storageId && (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.storageId.message}
                </p>
              )}
            </div>
          </div>

          {/* Quantity & Expiry Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-quantity"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Quantity *
              </label>
              <input
                id="edit-quantity"
                type="number"
                min="1"
                step="1"
                {...register("quantity")}
                className={`mt-1.5 ${inputClass(!!errors.quantity)}`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.quantity.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="edit-expiry"
                className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Expiry Date *
              </label>
              <input
                id="edit-expiry"
                type="date"
                {...register("expirationDate")}
                className={`mt-1.5 ${inputClass(!!errors.expirationDate)}`}
              />
              {errors.expirationDate && (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.expirationDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="edit-note"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Note
            </label>
            <textarea
              id="edit-note"
              rows={3}
              {...register("note")}
              className={`mt-1.5 ${inputClass(!!errors.note)}`}
            />
          </div>

          {/* Read-only status info */}
          <dl className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <InfoRow
              label="Status"
              value={isConsumed ? "Consumed" : isWasted ? "Wasted" : "In Stock"}
            />
            {isConsumed && (
              <InfoRow
                label="Consumed At"
                value={formatDateTime(currentProduct.consumedAt)}
              />
            )}
            {isWasted && (
              <InfoRow
                label="Wasted At"
                value={formatDateTime(currentProduct.wastedAt)}
              />
            )}
            <InfoRow label="Added" value={formatDateTime(product.createdAt)} />
            <InfoRow
              label="Last Updated"
              value={formatDateTime(currentProduct.updatedAt)}
            />
          </dl>
        </form>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting || !isDirty}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isActioning || isConsumed || isWasted}
              onClick={handleMarkConsumed}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConsumed ? "Already Consumed" : "Mark as Consumed"}
            </button>
            <button
              type="button"
              disabled={isActioning || isConsumed || isWasted}
              onClick={handleMarkWasted}
              className="rounded-xl bg-zinc-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWasted ? "Already Wasted" : "Mark as Wasted"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// — Info row sub-component
function InfoRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </dt>
      <dd
        className={`flex-1 break-words text-sm font-medium ${
          muted
            ? "italic text-zinc-400 dark:text-zinc-500"
            : "text-zinc-800 dark:text-zinc-100"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
