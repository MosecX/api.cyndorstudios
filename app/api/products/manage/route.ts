import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT up.id, u.username, p.name, up.license_key
       FROM user_products up
       JOIN users u ON up.user_id = u.id
       JOIN products p ON up.product_id = p.id`
    );

    // Siempre devolver un array, aunque esté vacío
    return new Response(JSON.stringify(rows || []), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error en /api/products/manage:", error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
