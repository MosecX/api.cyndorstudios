import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const db = await connectDB();
  const { token, newPassword } = await req.json();

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

  // Hashear la nueva contraseña
  const hashed = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña del usuario
  await db.execute(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashed, reset.user_id]
  );

  // Eliminar el token para que no se pueda reutilizar
  await db.execute("DELETE FROM reset_tokens WHERE token = ?", [token]);

  return new Response(
    JSON.stringify({ message: "Contraseña actualizada" }),
    { status: 200 }
  );
}
