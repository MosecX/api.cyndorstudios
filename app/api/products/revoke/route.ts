import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const db = await connectDB();

    await db.execute("DELETE FROM user_products WHERE id = ?", [id]);

    return NextResponse.json(
      { message: "Licencia revocada correctamente." },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error en /api/revoke-license:", error);
    return NextResponse.json(
      { error: "Error al revocar licencia" },
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
