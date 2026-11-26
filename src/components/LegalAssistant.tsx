import { useState } from "react";
import type { FormEvent } from "react";

type Lang = "ru" | "kk";
type Message = { role: "user" | "assistant"; content: string };

const prompts: Record<Lang, string[]> = {
  ru: [
    "Хочу расторгнуть брак. Какие у меня есть варианты?",
    "Как разделить имущество, приобретённое во время брака?",
    "Как определить размер и порядок выплаты алиментов?",
    "Как решается вопрос о месте жительства ребёнка?",
    "Мне направили иск. Как подготовить отзыв?",
    "Как заключить брачный договор?",
  ],
  kk: [
    "Некені бұзғым келеді. Қандай жолдар бар?",
    "Неке кезінде алынған мүлікті қалай бөлуге болады?",
    "Алимент мөлшері мен төлеу тәртібі қалай анықталады?",
    "Баланың тұрғылықты жері туралы мәселе қалай шешіледі?",
    "Маған талап қою жіберілді. Пікірді қалай дайындауға болады?",
    "Неке шартын қалай жасауға болады?",
  ],
};

export default function LegalAssistant({ language, onOpenDocuments }: { language: Lang; onOpenDocuments: () => void }) {
  const isKk = language === "kk";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  async function send(event?: FormEvent, suggestedText?: string) {
    event?.preventDefault();
    const text = (suggestedText ?? input).trim();
    if (!text || busy) return;
    if (!consent) {
      setError(isKk
        ? "Жалғастыру үшін хабарлама сыртқы ИИ қызметіне жіберілетінін түсінгеніңізді растаңыз."
        : "Для продолжения подтвердите, что понимаете: сообщение будет передано внешнему ИИ-сервису.");
      return;
    }
    const next: Message[] = [...messages, { role: "user" as const, content: text }].slice(-10);
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/legal-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (isKk ? "Қызмет уақытша қолжетімсіз." : "Сервис временно недоступен."));
      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error(isKk ? "Жауап алынбады. Қайталап көріңіз." : "Не удалось получить ответ. Попробуйте ещё раз.");
      }
      const updated: Message[] = [...next, { role: "assistant" as const, content: data.answer }];
      setMessages(updated.slice(-12));
    } catch (err) {
      setMessages(messages);
      setInput(text);
      setError(err instanceof Error ? err.message : (isKk ? "Қате орын алды." : "Произошла ошибка."));
    } finally {
      setBusy(false);
    }
  }

  function startNewCase() {
    if (busy) return;
    setMessages([]);
    setInput("");
    setError("");
  }

  function saveAnswer(content: string) {
    const printable = `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><title>${isKk ? "Құқықтық талдау" : "Правовой разбор"}</title><style>@page{size:A4;margin:20mm}body{font:14pt/1.55 "Times New Roman",serif;color:#172b3b}h1{font-size:18pt}pre{white-space:pre-wrap;font:inherit}</style></head><body><h1>${isKk ? "Құқықтық талдау" : "Правовой разбор"}</h1><pre>${content.replace(/[&<>]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]!))}</pre><p><small>${isKk ? "Ақпараттық материал. Заңгердің жеке қорытындысы емес." : "Информационный материал. Не является индивидуальным заключением юриста."}</small></p><script>window.onload=()=>window.print()<\\/script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) { setError(isKk ? "Басып шығару терезесін ашуға рұқсат беріңіз." : "Разрешите открыть окно печати."); return; }
    w.document.write(printable);
    w.document.close();
  }

  const welcomeTitle = isKk ? "Отбасы құқығы бойынша сұрағыңызды жазыңыз" : "Опишите свой вопрос по семейному праву";
  const welcomeText = isKk
    ? "Жағдайды өз сөзіңізбен баяндаңыз. Көмекші маңызды мән-жайларды анықтап, ҚР заңнамасы бойынша ықтимал құқықтық жолдарды, келесі қадамдарды және қажет болуы мүмкін құжаттарды түсіндіреді."
    : "Расскажите о ситуации своими словами. Ассистент уточнит важные обстоятельства, разберёт возможные правовые варианты по законодательству РК, объяснит дальнейшие шаги и подскажет, какие документы могут понадобиться.";

  return <div className="legal-assistant-wrap">
    <div className="legal-assistant-intro">
      <p className="eyebrow">{isKk ? "ҚҰҚЫҚТЫҚ КӨМЕКШІ" : "ПРАВОВОЙ ПОМОЩНИК"}</p>
      <h2>{isKk ? "Отбасы мәселесін түсініңіз. Құқықтық шешім жолын табыңыз." : "Разберитесь в семейном вопросе. Найдите правовой путь решения."}</h2>
      <p>{isKk
        ? "Еркін сұрақ қойыңыз — ұзақ сауалнама толтырудың қажеті жоқ. Қажет болса, көмекші нақтылаушы сұрақтар қойып, құжат дайындауға көмектеседі."
        : "Задайте вопрос в свободной форме — длинную анкету заполнять не нужно. При необходимости ассистент задаст уточняющие вопросы и поможет подготовить проект документа."}</p>
      <div className="assistant-expert">
        <span className="expert-monogram">§</span>
        <div><b>{isKk ? "ЖАСАНДЫ ИНТЕЛЛЕКТ" : "ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ"}</b><strong>Право Семьи AI</strong><small>{isKk ? "Қазақстан Республикасының отбасы құқығына маманданған виртуалды көмекші. Нақты адам немесе адвокат емес." : "Виртуальный помощник по семейному праву Республики Казахстан. Не является реальным человеком или адвокатом."}</small></div>
      </div>
      <div className="assistant-process">
        <span>01 · {isKk ? "Жағдайды талдау" : "Анализ ситуации"}</span>
        <span>02 · {isKk ? "Қолданылатын нормалар" : "Применимые нормы"}</span>
        <span>03 · {isKk ? "Әрекет және құжат" : "Действия и документы"}</span>
      </div>
      <p className="assistant-disclaimer">{isKk
        ? "Жауаптар ақпараттық сипатта. ИИ қателесуі мүмкін; маңызды нормалар мен мерзімдерді «Әділет» жүйесінен және маманнан тексеріңіз."
        : "Ответы носят информационный характер. ИИ может ошибаться; важные нормы и сроки необходимо сверять с ИПС «Әділет» и специалистом."}</p>
    </div>

    <div className="legal-chat">
      <div className="legal-chat-head">
        <div><span className="chat-status"></span><b>{isKk ? "Отбасы құқығы бойынша AI-көмекші" : "ИИ-ассистент по семейному праву"}</b><small>{isKk ? "Қазақстан Республикасы" : "Законодательство Республики Казахстан"}</small></div>
        <button className="chat-reset" type="button" onClick={startNewCase} disabled={busy}>{isKk ? "Жаңа сұрақ" : "Новый вопрос"}</button>
      </div>
      <div className="legal-chat-body" aria-live="polite">
        {messages.length === 0 && <div className="chat-welcome">
          <span>§</span><h3>{welcomeTitle}</h3><p>{welcomeText}</p>
          <div className="chat-suggestions-label">{isKk ? "НЕМЕСЕ ТАҚЫРЫПТЫ ТАҢДАҢЫЗ" : "ИЛИ ВЫБЕРИТЕ ТЕМУ"}</div>
          <div className="chat-suggestions">{prompts[language].map((prompt) => <button type="button" key={prompt} onClick={() => { setInput(prompt); setError(""); }}>{prompt}<span>↗</span></button>)}</div>
        </div>}
        {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}>
          <span>{message.role === "assistant" ? "§" : (isKk ? "Сіз" : "Вы")}</span>
          <div>{message.content}{message.role === "assistant" && <button className="answer-print" type="button" onClick={() => saveAnswer(message.content)}>{isKk ? "PDF ретінде сақтау / басып шығару" : "Сохранить в PDF / распечатать"}</button>}</div>
        </div>)}
        {busy && <div className="chat-thinking"><span></span><span></span><span></span>{isKk ? "Жағдай мен құқықтық нормаларды талдау..." : "Анализирую обстоятельства и правовые нормы..."}</div>}
      </div>
      <form className="legal-chat-form" onSubmit={send}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} maxLength={4000} placeholder={isKk ? "Жағдайды өз сөзіңізбен жазыңыз..." : "Опишите ситуацию своими словами..."} aria-label={isKk ? "Жағдай сипаттамасы" : "Описание ситуации"} />
        <label className="privacy-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
          {isKk
            ? "Хабарлама сыртқы ИИ-провайдеріне өңдеу үшін жіберілетінін түсінемін және ЖСН, толық мекенжай, телефон, банк деректері мен балалардың жеке деректерін енгізбеймін."
            : "Я понимаю, что сообщение передаётся внешнему ИИ-провайдеру для обработки, и не указываю ИИН, полный адрес, телефон, банковские данные и персональные данные детей."}
        </label>
        {error && <p className="chat-error" role="alert">{error}</p>}
        <div className="chat-form-bottom"><small>{isKk ? "Диалог осы браузерде ғана көрсетіледі; хабарлама өңделеді Gemini API арқылы." : "Сообщение обрабатывается подключённым ИИ-провайдером. Не отправляйте документы и избыточные персональные данные."}</small>
          <button className="btn btn-primary" disabled={busy || !input.trim()} type="submit">{busy ? (isKk ? "Талдау..." : "Анализ...") : (isKk ? "Жіберу ↑" : "Отправить ↑")}</button>
        </div>
      </form>
      <div className="chat-documents-link"><span>{isKk ? "Құжат дайындау немесе үлгіні табу керек пе?" : "Нужно подготовить документ или найти образец?"}<br/><small>{isKk ? "Сәйкес құжатты таңдау үшін кітапхананы ашыңыз." : "Откройте библиотеку, чтобы посмотреть доступные формы."}</small></span>
        <button type="button" onClick={onOpenDocuments}>{isKk ? "Құжаттар бөлімі →" : "Библиотека документов →"}</button>
      </div>
    </div>
  </div>;
}
