import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  const db = await connectDB();
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id, name FROM products"
  );

  return new Response(JSON.stringify(rows), { status: 200 });
}
