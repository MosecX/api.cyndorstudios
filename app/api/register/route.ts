// app/api/register/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await connectDB();
    const [result]: any = await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // Crear token JWT inmediatamente después de registrar
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET!, // asegúrate de tenerlo en tu .env.local
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
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en /api/register:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500, headers: corsHeaders }
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
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
