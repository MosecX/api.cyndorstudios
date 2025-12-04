// app/api/me/route.ts
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
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
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
