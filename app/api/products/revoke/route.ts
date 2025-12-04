import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  const { id } = await req.json();
  const db = await connectDB();

  await db.execute("DELETE FROM user_products WHERE id = ?", [id]);

  return new Response(JSON.stringify({ message: "Licencia revocada correctamente." }), { status: 200 });
}
