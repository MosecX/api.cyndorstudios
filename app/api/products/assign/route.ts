import { connectDB } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const { adminId, userId, productId } = await req.json();

    // Verificar rol del admin
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );
    const admin = rows[0];

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para asignar productos" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Obtener producto
    const [productRows] = await db.execute<RowDataPacket[]>(
      "SELECT id, name, type FROM products WHERE id = ?",
      [productId]
    );
    const product = productRows[0];
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Generar licencia única si el producto es tipo "license"
    let licenseKey: string | null = null;
    if (product.type === "license") {
      licenseKey = crypto.randomBytes(16).toString("hex");
    }

    // Insertar asignación
    await db.execute(
      "INSERT INTO user_products (user_id, product_id, license_key) VALUES (?, ?, ?)",
      [userId, productId, licenseKey]
    );

    // Obtener datos del usuario
    const [userRows] = await db.execute<RowDataPacket[]>(
      "SELECT email, username FROM users WHERE id = ?",
      [userId]
    );
    const user = userRows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 📧 Configurar transporte Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 📧 Preparar contenido dinámico
    let subject = "Nuevo producto asignado";
    let html = "";

    if (licenseKey) {
      subject = "Nueva licencia asignada";
      html = `
        <div style="font-family: 'Segoe UI', sans-serif; color: #1a1a1a; padding: 24px;">
          <h2 style="color: #2e86de;">Licencia asignada exitosamente</h2>
          <p>Hola <strong style="color: #333;">${user.username}</strong>,</p>
          <p>Se te ha asignado una nueva licencia para el producto <strong style="color: #2e86de;">${product.name}</strong>.</p>
          <div style="margin: 24px 0; padding: 20px; background-color: #f4f4f4; border-left: 4px solid #2ecc71;">
            <p style="font-size: 18px; font-weight: bold; text-align: center; color: #27ae60;">${licenseKey}</p>
          </div>
          <p>Si necesitás ayuda técnica, podés contactarnos en nuestro canal de soporte:</p>
          <a href="https://discord.gg/D8XTG3UfjM" target="_blank" style="display:inline-block;background-color:#5865F2;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Ir al soporte en Discord</a>
          <p style="margin-top:32px;font-size:14px;color:#888;">— Cyndor Studios · Seguridad y elegancia en cada acceso</p>
        </div>
      `;
    } else {
      html = `
        <div style="font-family: 'Segoe UI', sans-serif; color: #1a1a1a; padding: 24px;">
          <h2 style="color: #2e86de;">Producto asignado</h2>
          <p>Hola <strong style="color: #333;">${user.username}</strong>,</p>
          <p>Se te ha asignado el producto <strong style="color: #2e86de;">${product.name}</strong>. Ya podés acceder desde tu panel de usuario.</p>
          <p style="margin-top:32px;font-size:14px;color:#888;">— Cyndor Studios · Seguridad y elegancia en cada acceso</p>
        </div>
      `;
    }

    // 📧 Enviar correo
    await transporter.sendMail({
      from: `"Cyndor Studios" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json(
      { message: "Producto asignado y correo enviado", licenseKey },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error en /api/assign-product:", error);
    return NextResponse.json(
      { error: "Error al asignar producto" },
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
