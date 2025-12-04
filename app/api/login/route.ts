// app/api/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    const db = await connectDB();
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({ message: "Login exitoso", user });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
