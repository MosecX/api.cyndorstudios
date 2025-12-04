import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { actual, nueva } = await req.json();
    const cookieStore = await cookies(); // ✅ sin await
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const db = await connectDB();
    const [rows]: any = await db.execute("SELECT password FROM users WHERE id = ?", [userId]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = rows[0];
    const match = await bcrypt.compare(actual, user.password);

    if (!match) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 403 });
    }

    const hashed = await bcrypt.hash(nueva, 10);
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en /api/password:", error);
    return NextResponse.json({ error: "Error al cambiar contraseña" }, { status: 500 });
  }
}
