import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const { userId } = await req.json();

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id, p.name, p.description, p.type, up.license_key, up.assigned_at
       FROM products p
       JOIN user_products up ON p.id = up.product_id
       WHERE up.user_id = ?`,
      [userId]
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error en /api/user-products:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener productos del usuario" }),
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
  "Access-Control-Allow-Origin": "https://cyndonstudios.vercel.app", // tu frontend
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
