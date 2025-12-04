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
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno en /api/ping" }),
      { status: 500 }
    );
  }
}
