import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ sin await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const db = await connectDB();
    const [rows]: any = await db.execute(
      `SELECT product_id, license_key, assigned_at 
       FROM user_products 
       WHERE user_id = ? 
       ORDER BY assigned_at DESC`,
      [userId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error en /api/licenses:", error);
    return NextResponse.json({ error: "Error al obtener productos/licencias" }, { status: 500 });
  }
}
