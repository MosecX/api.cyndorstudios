import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const { userId, name, description, type } = await req.json();

    // Verificar rol del usuario
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );
    const user = rows[0];

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para crear productos" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Crear producto
    await db.execute(
      "INSERT INTO products (name, description, type) VALUES (?, ?, ?)",
      [name, description, type]
    );

    return NextResponse.json(
      { message: "Producto creado correctamente" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error en /api/create-product:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ Bloque CORS reutilizable
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cyndonstudios.vercel.app", // tu frontend
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handler para preflight OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
