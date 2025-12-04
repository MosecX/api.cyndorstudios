// app/api/me/route.ts
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401, headers: corsHeaders });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const db = await connectDB();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [decoded.id]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ user }, { status: 200, headers: corsHeaders });
  } catch {
    return NextResponse.json({ user: null }, { status: 401, headers: corsHeaders });
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
