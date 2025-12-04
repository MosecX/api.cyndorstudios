import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const db = await connectDB();
  const { userId, name, description, type } = await req.json();

  // Verificar rol del usuario
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT role FROM users WHERE id = ?",
    [userId]
  );
  const user = rows[0];

  if (!user || user.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "No tienes permisos para crear productos" }),
      { status: 403 }
    );
  }

  // Crear producto
  await db.execute(
    "INSERT INTO products (name, description, type) VALUES (?, ?, ?)",
    [name, description, type]
  );

  return new Response(
    JSON.stringify({ message: "Producto creado correctamente" }),
    { status: 200 }
  );
}
