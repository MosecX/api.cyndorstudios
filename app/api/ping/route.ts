export async function GET() {
  try {
    // Marca de tiempo actual
    const now = Date.now();

    return new Response(
      JSON.stringify({
        message: "pong",
        timestamp: now,
        version: "1.0.0", // versión del dashboard
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno en /api/ping" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
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
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
