"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import {
  addProductSchema,
  type AddProductInput,
} from "@/validation/addProduct";
import { createProductAction } from "./actions";

interface OptionItem {
  id: string;
  name: string;
}

interface AddProductFormProps {
  categories: OptionItem[];
  storages: OptionItem[];
}

// Custom Zod resolver to seamlessly integrate with React Hook Form without extra dependencies
const customZodResolver: Resolver<AddProductInput> = async (values) => {
  const result = addProductSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of result.error.issues) {
    const fieldName = String(issue.path[0] || "");
    if (fieldName && !errors[fieldName]) {
      errors[fieldName] = {
        type: issue.code,
        message: issue.message,
      };
    }
  }

  return {
    values: {} as AddProductInput,
    errors: errors as unknown as Parameters<
      typeof customZodResolver
    >[0] extends AddProductInput
      ? never
      : Record<string, { type: string; message: string }>,
  };
};

export default function AddProductForm({
  categories,
  storages,
}: AddProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddProductInput>({
    resolver: customZodResolver,
    defaultValues: {
      name: "",
      quantity: 1,
      note: "",
      expirationDate: "",
      storageId: "",
      categoryId: "",
    },
  });

  const onSubmit = async (data: AddProductInput) => {
    setServerError(null);
    setServerSuccess(null);
    setIsPending(true);

    try {
      const response = await createProductAction(data);

      if (!response.success) {
        setServerError(response.message);
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, messages]) => {
            if (messages && messages[0]) {
              setError(field as keyof AddProductInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }
        setIsPending(false);
        return;
      }

      setServerSuccess(
        "Product successfully added! Redirecting to My Products...",
      );
      reset();

      // Navigate to My Products page
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Form submit error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  const loading = isSubmitting || isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-8"
      noValidate
    >
      {/* Alert Status Banners */}
      {serverError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Failed to save product</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
              {serverError}
            </p>
          </div>
        </div>
      )}

      {serverSuccess && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Success!</p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              {serverSuccess}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Product Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5">
            <input
              id="name"
              type="text"
              placeholder="e.g. Canned Kidney Beans"
              disabled={loading}
              {...register("name")}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Category & Storage Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Category Field */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5">
              <select
                id="categoryId"
                disabled={loading}
                {...register("categoryId")}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 ${
                  errors.categoryId
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Storage Field */}
          <div>
            <label
              htmlFor="storageId"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Storage Location <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5">
              <select
                id="storageId"
                disabled={loading}
                {...register("storageId")}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 ${
                  errors.storageId
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                }`}
              >
                <option value="">Select storage location</option>
                {storages.map((sto) => (
                  <option key={sto.id} value={sto.id}>
                    {sto.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.storageId && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.storageId.message}
              </p>
            )}
          </div>
        </div>

        {/* Quantity & Expiry Date Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Quantity Field */}
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5">
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="1"
                disabled={loading}
                {...register("quantity")}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 ${
                  errors.quantity
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                }`}
              />
            </div>
            {errors.quantity && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Expiry Date Field */}
          <div>
            <label
              htmlFor="expirationDate"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5">
              <input
                id="expirationDate"
                type="date"
                disabled={loading}
                {...register("expirationDate")}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 ${
                  errors.expirationDate
                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                }`}
              />
            </div>
            {errors.expirationDate && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.expirationDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Note Field (Optional) */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="note"
              className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Note
            </label>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Optional
            </span>
          </div>
          <div className="mt-1.5">
            <textarea
              id="note"
              rows={3}
              placeholder="e.g. Keep refrigerated once opened, bought on weekend sale"
              disabled={loading}
              {...register("note")}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-xs outline-none transition dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 ${
                errors.note
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-800"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              }`}
            />
          </div>
          {errors.note && (
            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.note.message}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 sm:w-auto"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Product</span>
          )}
        </button>
      </div>
    </form>
  );
}
