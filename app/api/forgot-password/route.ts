import nodemailer from "nodemailer";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const db = await connectDB();
  const { email } = await req.json();

  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  const user = rows[0] as RowDataPacket | undefined;

  if (!user) {
    return new Response(
      JSON.stringify({ message: "Si existe, se enviará correo" }),
      { status: 200 }
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
      <a href="http://localhost:3000/reset-password?token=${token}">
        Restablecer contraseña
      </a>
      <p>Este enlace expira en 15 minutos.</p>
    `,
  });

  return new Response(
    JSON.stringify({ message: "Correo enviado si el email existe." }),
    { status: 200 }
  );
}
