import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = wawit cookies(); // ✅ es síncrono, no uses await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401, headers: corsHeaders }
      );
    }

    // ⚡ Decodificar el JWT
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const db = await connectDB();
    const [rows]: any = await db.execute(
      "SELECT id, username, email, role, createdAt FROM users WHERE id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(rows[0], { headers: corsHeaders });
  } catch (error) {
    console.error("Error en /api/account:", error);
    return NextResponse.json(
      { error: "Error al obtener datos" },
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
