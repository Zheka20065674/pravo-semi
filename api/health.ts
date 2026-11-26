export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
  return res.status(200).json({
    ok: true,
    service: "pravo-semi-api",
    route: "/api/health",
    runtime: "nodejs",
    providersConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    timestamp: new Date().toISOString()
  });
}
