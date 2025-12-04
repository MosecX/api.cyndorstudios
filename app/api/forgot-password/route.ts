import nodemailer from "nodemailer";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const { email } = await req.json();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0] as RowDataPacket | undefined;

    if (!user) {
      return NextResponse.json(
        { message: "Si existe, se enviará correo" },
        { status: 200, headers: corsHeaders }
      );
    }

    // 🔴 BORRAR tokens viejos de este usuario
    await db.execute("DELETE FROM reset_tokens WHERE user_id = ?", [user.id]);

    // 🔑 Generar nuevo token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.execute(
      "INSERT INTO reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
      [token, user.id, expiresAt]
    );

    // 📧 Enviar correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Cyndor Studios" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Recuperar contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="https://cyndonstudios.vercel.app/reset-password?token=${token}">
          Restablecer contraseña
        </a>
        <p>Este enlace expira en 15 minutos.</p>
      `,
    });

    return NextResponse.json(
      { message: "Correo enviado si el email existe." },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error en /api/forgot-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ Bloque CORS reutilizable
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cyndonstudios.vercel.app",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handler para preflight OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
