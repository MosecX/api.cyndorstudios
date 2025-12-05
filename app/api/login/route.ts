// app/api/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if ((!email && !username) || !password) {
      return NextResponse.json(
        { error: "Debes ingresar usuario/email y contraseña" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await connectDB();

    // 🔎 Buscar usuario por email o username
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Usuario o correo no encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 🔑 Validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 🎟️ Crear token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // 🍪 Guardar token en cookie
    const response = NextResponse.json(
      { message: "Login correcto" },
      { headers: corsHeaders }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en /api/login:", error.message, error.stack);
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

// ✅ Handler para preflight OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
