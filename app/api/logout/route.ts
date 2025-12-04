// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Crear respuesta
  const response = NextResponse.json({ message: "Logout exitoso" });

  // Borrar la cookie 'token'
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // expira inmediatamente
    path: "/",
  });

  return response;
}
