import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const db = await connectDB();

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM users"
    );
    const [products] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM products"
    );
    const [licenses] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM user_products WHERE license_key IS NOT NULL"
    );

    return new Response(
      JSON.stringify({
        users: users[0].total,
        products: products[0].total,
        licenses: licenses[0].total,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error en /api/stats:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener estadísticas" }),
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
