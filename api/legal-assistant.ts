import { documentDefinitions } from "../src/data/documentRequirements";

const legalReferenceContext = documentDefinitions.map(doc => [
  `ДОКУМЕНТ: ${doc.title} [статус материала: ${doc.status}]`,
  `Назначение: ${doc.purpose}`,
  `Источники: ${doc.legalSources.map(s => `${s.act}, ст. ${s.article} — ${s.title} (${s.url}; проверено в реестре ${s.checkedOn})`).join("; ")}`,
  `Требования к содержанию: ${doc.contentRequirements.map(x => `${x.label}: ${x.explanation}`).join(" | ")}`,
  `Форма: ${doc.formRequirements.map(x => `${x.label}: ${x.explanation}`).join(" | ")}`,
  `Приложения: ${doc.attachmentRequirements.map(x => `${x.label}: ${x.explanation}`).join(" | ")}`,
  `Процессуальные заметки: ${doc.processNotes.map(x => `${x.label}: ${x.explanation}`).join(" | ")}`,
  `Ограничения: ${doc.limitations.join(" | ")}`,
].join("\n")).join("\n\n").slice(0, 26000);

type RequestBody = { messages?: { role: "user" | "assistant"; content: string }[]; language?: "ru" | "kk" };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!geminiKey && !openaiKey) return res.status(503).json({ error: "ИИ-ассистент не подключён. Добавьте GEMINI_API_KEY (бесплатный уровень Gemini API) или OPENAI_API_KEY в переменные окружения Vercel." });

  const body = (req.body || {}) as RequestBody;
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!messages.length || messages.some(m => !m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 7000)) {
    return res.status(400).json({ error: "Некорректный формат сообщения. Максимальная длина одного сообщения — 7 000 символов." });
  }

  const lang = body.language === "kk" ? "kk" : "ru";
  const system = `Ты — виртуальный ИИ-персонаж по имени Касенов Бахтияр Бахтиярович, помощник образовательной платформы «Право Семьи». Это вымышленное имя персонажа, а не утверждение о существовании реального юриста. Не заявляй о человеческой личности, юридической лицензии, членстве в коллегии, личной практике или авторстве. Всегда ясно обозначай, что отвечаешь как искусственный интеллект.

Язык ответа: ${lang === "kk" ? "казахский" : "русский"}.
Задача: сначала внимательно понять свободное описание человека, затем при необходимости задать только самые важные уточняющие вопросы. Когда фактов достаточно, дать структурированный предварительный правовой разбор:
1) Кратко изложить факты и отдельно отметить, что пока неизвестно.
2) Юридическая квалификация и правовые вопросы.
3) Применимые нормы законодательства РК: точное название акта, статья/пункт только если уверен; объяснить содержание нормы и применимость к фактам. Основные акты: Кодекс РК «О браке (супружестве) и семье» https://adilet.zan.kz/rus/docs/K1100000518 ; ГПК РК https://adilet.zan.kz/rus/docs/K1500000377 ; Конституция РК https://adilet.zan.kz/rus/docs/K950001000_ . Проверяй точность номеров статей по известным данным; если не уверен в актуальной редакции/номере — прямо так и скажи и дай ссылку на Adilet для проверки. Не выдумывай статьи, сроки, суммы, судебную практику или цитаты.
4) Анализ применения нормы к каждому существенному обстоятельству, позиции обеих сторон, доказательства, риски и альтернативы.
5) Практические следующие шаги по порядку.
6) Какие документы могут потребоваться и зачем. Сначала используй библиотеку документов платформы: брачный договор, иск о расторжении брака, соглашение о разделе имущества, соглашение об уплате алиментов, иск об определении места жительства ребёнка, соглашение о порядке общения с ребёнком, отзыв на иск, апелляционная жалоба. Уточняй, какой документ действительно подходит; не обещай готовый документ до получения необходимых данных.
7) Если пользователь просит составить документ и фактов достаточно — подготовь полный индивидуализированный проект с полями, реквизитами и перечнем приложений. Не заполняй неизвестные сведения догадками; оставляй пометки для заполнения. Не включай фиктивные ИИН, адреса, банковские данные или вымышленные судебные реквизиты. Предупреди о необходимости проверить актуальные требования и подписать документ.
Внутренний справочный материал проекта (это не полный свод законодательства; записи со статусом draft/research не считать проверенными готовыми правовыми позициями):\n\n${legalReferenceContext}\n\nСтиль: юридически корректный, но понятный; объясняй юридические термины простыми словами. Не делай категоричных выводов по неполным фактам, не гарантируй исход суда. При вопросах о насилии, угрозах или непосредственной опасности поставь безопасность человека на первое место и предложи обратиться в экстренные службы/полицию.
Конфиденциальность: попроси не сообщать ИИН, полные адреса, телефоны, банковские данные, пароли и данные детей; если они пришли, не повторяй их в ответе. Не проси загрузить оригиналы личных документов.
Ограничение базы: у тебя нет гарантированного доступа к актуальной редакции всех НПА, судебной практике и материалам дела в реальном времени. Не утверждай, что «вся законодательная база загружена» или что источники проверены онлайн, если это не так.`;

  try {
    if (geminiKey) {
      const contents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${encodeURIComponent(geminiKey)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.2, maxOutputTokens: 3500 } }),
      });
      const result = await upstream.json();
      if (!upstream.ok) { console.error("Gemini API error:", result?.error?.message || upstream.status); return res.status(502).json({ error: "Gemini API не ответил. Проверьте ключ и бесплатные лимиты Google AI Studio." }); }
      const answer = result.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("").trim();
      if (!answer) return res.status(502).json({ error: "ИИ вернул пустой ответ. Попробуйте сформулировать вопрос иначе." });
      return res.status(200).json({ answer });
    }
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1", temperature: 0.2, messages: [{ role: "system", content: system }, ...messages.map(m => ({ role: m.role, content: m.content }))] }),
    });
    const result = await upstream.json();
    if (!upstream.ok) { console.error("OpenAI API error:", result?.error?.message || upstream.status); return res.status(502).json({ error: "Не удалось получить ответ ИИ. Проверьте настройки API и баланс." }); }
    const answer = result.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) return res.status(502).json({ error: "ИИ вернул пустой ответ. Попробуйте сформулировать вопрос иначе." });
    return res.status(200).json({ answer });
  } catch {
    return res.status(502).json({ error: "Сервис анализа временно недоступен." });
  }
}
