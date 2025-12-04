import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const db = await connectDB();
  const { token } = await req.json();

  // Buscar el token en la tabla reset_tokens
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM reset_tokens WHERE token = ?",
    [token]
  );

  const reset = rows[0] as RowDataPacket | undefined;

  // Validar existencia y expiración
  if (!reset || new Date(reset.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: "Token inválido o expirado" }),
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({ message: "Token válido" }),
    { status: 200 }
  );
}
