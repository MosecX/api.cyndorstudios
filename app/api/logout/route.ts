// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Crear respuesta con CORS
  const response = NextResponse.json(
    { message: "Logout exitoso" },
    { headers: corsHeaders }
  );

  // Borrar la cookie 'token'
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // expira inmediatamente
    path: "/",
  });

  return response;
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
