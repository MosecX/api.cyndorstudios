import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const db = await connectDB();
  const { userId } = await req.json();

  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT p.id, p.name, p.description, p.type, up.license_key, up.assigned_at
     FROM products p
     JOIN user_products up ON p.id = up.product_id
     WHERE up.user_id = ?`,
    [userId]
  );

  return new Response(JSON.stringify(rows), { status: 200 });
}
