import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  const db = await connectDB();

  const [users] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as total FROM users");
  const [products] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as total FROM products");
  const [licenses] = await db.execute<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM user_products WHERE license_key IS NOT NULL"
  );

  return new Response(
    JSON.stringify({
      users: users[0].total,
      products: products[0].total,
      licenses: licenses[0].total,
    }),
    { status: 200 }
  );
}
