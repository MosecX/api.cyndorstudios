import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, name FROM products"
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error en /api/products:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener productos" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}

// ✅ Bloque CORS reutilizable
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cyndorstudios.vercel.app",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handler para preflight OPTIONS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
