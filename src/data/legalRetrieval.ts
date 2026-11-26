export type RetrievedSource = {
  id: string;
  title: string;
  url: string;
  status: "retrieved" | "unavailable";
  checkedAt: string;
  excerpt?: string;
};

type OfficialSource = {
  id: string;
  title: string;
  url: string;
  alternateUrl: string;
  topics: RegExp;
};

const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    id: "family-code",
    title: "Кодекс Республики Казахстан «О браке (супружестве) и семье»",
    url: "https://adilet.zan.kz/rus/docs/K1100000518",
    alternateUrl: "https://old.adilet.zan.kz/rus/docs/K1100000518",
    topics: /семь|брак|супруг|развод|расторж|алим|реб[её]н|родител|отцовств|материнств|усынов|опек|попеч|имуще|собствен|дол[яи]|брачн|совместн|раздел|содержан|мест[ао] жительств|общени[ея]/i,
  },
  {
    id: "civil-procedure-code",
    title: "Гражданский процессуальный кодекс Республики Казахстан",
    url: "https://adilet.zan.kz/rus/docs/K1500000377",
    alternateUrl: "https://old.adilet.zan.kz/rus/docs/K1500000377",
    topics: /суд|иск|заявлен|подсуд|процесс|доказатель|апелляц|отзыв|ходатай|решени|жалоб|представител|пошлин|срок|исполнител|судебн|подач|возражен|примирен/i,
  },
  {
    id: "mediation-law",
    title: "Закон Республики Казахстан «О медиации»",
    url: "https://adilet.zan.kz/rus/docs/Z1100000401",
    alternateUrl: "https://old.adilet.zan.kz/rus/docs/Z1100000401",
    topics: /медиац|медиатор|примирен|урегулирован|досудебн|соглашени[ея].{0,25}спор|без суда/i,
  },
];

const legalTextCache = new Map<string, { text: string; checkedAt: string }>();

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function htmlToLegalText(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractRelevantLegalText(text: string, query: string): string {
  const articlePattern = /(?:^|\n)\s*(Статья\s+\d+(?:-\d+)?\.?[^\n]*)/gim;
  const headings: Array<{ start: number; title: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = articlePattern.exec(text)) !== null) {
    headings.push({ start: match.index, title: match[1].trim() });
  }

  const terms = Array.from(new Set(
    query.toLocaleLowerCase("ru").match(/[а-яёәғқңөұүһі]{4,}/giu) || []
  )).filter(term => !/^(какие|какая|какой|можно|нужно|если|когда|пожалуйста|здравствуйте|помогите|хочу|имеет|право|закон|республика|казахстан|ситуация|вопрос|семейный|семейное)$/i.test(term));

  if (headings.length > 0) {
    const scored = headings.map((heading, index) => {
      const end = headings[index + 1]?.start ?? text.length;
      const section = text.slice(heading.start, end).trim();
      const lower = section.toLocaleLowerCase("ru");
      const score = terms.reduce((sum, term) => sum + (lower.includes(term) ? 2 : 0), 0);
      return { ...heading, section, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    if (scored.length) {
      const selected: string[] = [];
      let size = 0;
      for (const item of scored.slice(0, 12)) {
        if (size + item.section.length > 17000) continue;
        selected.push(item.section);
        size += item.section.length;
      }
      if (selected.length) return selected.join("\n\n---\n\n");
    }
  }

  const windows: Array<{ start: number; text: string }> = [];
  const lowerText = text.toLocaleLowerCase("ru");
  for (const term of terms.slice(0, 18)) {
    const index = lowerText.indexOf(term);
    if (index >= 0) {
      const start = Math.max(0, index - 700);
      windows.push({ start, text: text.slice(start, Math.min(text.length, index + 1900)) });
    }
  }
  const unique = Array.from(new Map(windows.map(item => [Math.floor(item.start / 600), item])).values());
  return unique.slice(0, 8).map(item => item.text).join("\n\n---\n\n").slice(0, 14000);
}

export async function retrieveOfficialSources(query: string): Promise<{ sources: RetrievedSource[]; context: string }> {
  const selected = OFFICIAL_SOURCES.filter(source => source.topics.test(query));
  if (!selected.some(source => source.id === "family-code")) selected.unshift(OFFICIAL_SOURCES[0]);
  const checkedAt = new Date().toISOString();

  const results = await Promise.all(selected.map(async source => {
    try {
      let cached = legalTextCache.get(source.id);
      if (!cached || Date.now() - Date.parse(cached.checkedAt) > 10 * 60 * 1000) {
        let html = "";
        for (const url of [source.url, source.alternateUrl]) {
          try {
            const response = await fetch(url, {
              headers: { "User-Agent": "Pravo-Semi-Legal-Assistant/1.0", "Accept": "text/html,application/xhtml+xml" },
              signal: AbortSignal.timeout(5500),
            });
            if (response.ok) {
              html = await response.text();
              if (html.length > 5000) break;
            }
          } catch { /* use the official legacy host as fallback */ }
        }
        if (html.length < 5000) throw new Error("Official legal text could not be retrieved");
        cached = { text: htmlToLegalText(html), checkedAt };
        legalTextCache.set(source.id, cached);
      }
      const excerpt = extractRelevantLegalText(cached.text, query);
      if (!excerpt || excerpt.length < 250) throw new Error("No relevant article fragments found");
      return { source, status: "retrieved" as const, excerpt, checkedAt: cached.checkedAt };
    } catch {
      return { source, status: "unavailable" as const, excerpt: "", checkedAt };
    }
  }));

  const sources: RetrievedSource[] = results.map(item => ({
    id: item.source.id,
    title: item.source.title,
    url: item.source.url,
    status: item.status,
    checkedAt: item.checkedAt,
    ...(item.status === "retrieved" ? { excerpt: item.excerpt.slice(0, 17000) } : {}),
  }));

  const context = results.filter(item => item.status === "retrieved").map(item =>
    "ОФИЦИАЛЬНЫЙ ТЕКСТ, ПОЛУЧЕННЫЙ ИЗ ИПС «ӘДІЛЕТ»\nАКТ: " + item.source.title +
    "\nССЫЛКА: " + item.source.url +
    "\nВремя получения текста сервером: " + item.checkedAt +
    "\nРЕЛЕВАНТНЫЕ ФРАГМЕНТЫ (поисковая выборка, не полный текст акта):\n" + item.excerpt
  ).join("\n\n====================\n\n");

  return { sources, context };
}
