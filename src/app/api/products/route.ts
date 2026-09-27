import db from "@/lib/db";
import { randomUUID } from "node:crypto";
import { addProductSchema } from "@/validation/addProduct";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    const validatedFields = addProductSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, quantity, note, expirationDate, storageId, categoryId } =
      validatedFields.data;
    const productId = randomUUID();

    const insertProductStmt = db.prepare(
      "INSERT INTO products (id, name, quantity, note, expirationDate, storageId, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    insertProductStmt.run(
      productId,
      name,
      quantity,
      note,
      expirationDate,
      storageId,
      categoryId,
    );

    return NextResponse.json({
      success: true,
      message: "Product succesfully added!",
    });
  } catch (error) {
    console.error("POST /api/products Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 },
    );
  }
}
