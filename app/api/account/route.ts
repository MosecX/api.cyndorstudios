import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // ⚡ Decodificar el JWT
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.id;

        const db = await connectDB();
        const [rows]: any = await db.execute(
            "SELECT id, username, email, role, createdAt FROM users WHERE id = ?",
            [userId]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error("Error en /api/account:", error);
        return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
    }
}
