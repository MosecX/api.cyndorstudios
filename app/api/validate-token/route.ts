import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
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
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(JSON.stringify({ message: "Token válido" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error en /api/validate-token:", error);
    return new Response(
      JSON.stringify({ error: "Error interno" }),
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
  "Access-Control-Allow-Origin": "https://cyndonstudios.vercel.app", // tu frontend
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
