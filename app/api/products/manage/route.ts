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
    return new Response(JSON.stringify(rows || []), { status: 200 });
  } catch (error) {
    console.error("Error en /api/products/manage:", error);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
