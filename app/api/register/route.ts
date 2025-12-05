// app/api/register/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await connectDB();

    // 🔎 Verificar duplicados por separado
    const [userRows]: any = await db.execute("SELECT id FROM users WHERE username = ?", [username]);
    if (userRows.length > 0) {
      return NextResponse.json(
        { error: `El usuario "${username}" ya está en uso` },
        { status: 409, headers: corsHeaders }
      );
    }

    const [emailRows]: any = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (emailRows.length > 0) {
      return NextResponse.json(
        { error: `El correo "${email}" ya está registrado` },
        { status: 409, headers: corsHeaders }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result]: any = await db.execute(
      "INSERT INTO users (username, email, password, createdAt, role) VALUES (?, ?, ?, NOW(), 'user')",
      [username, email, hashedPassword]
    );

    // Crear token JWT
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Guardar token en cookie
    const response = NextResponse.json(
      { message: "Usuario registrado correctamente" },
      { headers: corsHeaders }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en /api/register:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ Bloque CORS reutilizable
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cyndorstudios.vercel.app",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
