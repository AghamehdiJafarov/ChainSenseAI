// Vercel serverless function — проксирует запросы фронтенда к Anthropic API.
// Ключ хранится в переменной окружения ANTHROPIC_API_KEY и никогда не попадает в браузер.
// Фронтенд вызывает /api/claude с телом { messages, system?, ... }; модель и лимит задаются здесь.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    return;
  }

  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        ...payload,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json(data);
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
