import { useState } from "react";
import type { FormEvent } from "react";

type Lang = "ru" | "kk";
type Message = { role: "user" | "assistant"; content: string };

export default function LegalAssistant({ language, onOpenDocuments }: { language: Lang; onOpenDocuments: () => void }) {
  const isKk = language === "kk";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    if (!consent) {
      setError(isKk ? "Жалғастыру үшін құпия деректерді жібермеу туралы ескертумен келісіңіз." : "Чтобы продолжить, подтвердите, что не отправляете избыточные персональные данные.");
      return;
    }
    const next = [...messages, { role: "user" as const, content: text }];
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
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isKk ? "Қате орын алды." : "Произошла ошибка."));
    } finally {
      setBusy(false);
    }
  }

  function saveAnswer(content: string) {
    const printable = `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><title>${isKk ? "Құқықтық талдау" : "Правовой разбор"}</title><style>@page{size:A4;margin:20mm}body{font:14pt/1.55 "Times New Roman",serif;color:#172b3b}h1{font-size:18pt}pre{white-space:pre-wrap;font:inherit}</style></head><body><h1>${isKk ? "Құқықтық талдау" : "Правовой разбор"}</h1><pre>${content.replace(/[&<>]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]!))}</pre><p><small>${isKk ? "Ақпараттық материал. Қол қойылған заң қорытындысы емес." : "Информационный материал. Не является подписанным юридическим заключением."}</small></p><script>window.onload=()=>window.print()<\\/script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) { setError(isKk ? "Басып шығару терезесін ашуға рұқсат беріңіз." : "Разрешите открыть окно печати."); return; }
    w.document.write(printable);
    w.document.close();
  }

  return <div className="legal-assistant-wrap">
    <div className="legal-assistant-intro">
      <p className="eyebrow">{isKk ? "ҚҰҚЫҚТЫҚ КӨМЕКШІ" : "ПРАВОВОЙ ПОМОЩНИК"}</p>
      <h2>{isKk ? "Айтыңыз, не болды. Бірге құқықтық жолын талдаймыз." : "Расскажите, что произошло. Разберём правовую сторону ситуации."}</h2>
      <p>{isKk ? "Сауалнама жоқ: жағдайды өз сөзіңізбен сипаттаңыз. Көмекші мән-жайларды анықтап, заң нормаларын түсіндіреді және келесі қадамдарды ұсынады." : "Вместо анкеты — свободное описание ситуации. Ассистент уточнит важные обстоятельства, объяснит применимые нормы и предложит дальнейшие шаги."}</p>
      <div className="assistant-expert">
        <span className="expert-monogram">КБ</span>
        <div><b>{isKk ? "Виртуалды AI-көмекші" : "Виртуальный ИИ-помощник"}</b><strong>Касенов Бахтияр Бахтиярович</strong><small>{isKk ? "«НашаKZаша» шоуындағы кейіпкерден алынған ойдан шығарылған есім. Бұл нақты заңгер емес, жасанды интеллект." : "Вымышленное имя персонажа из шоу «НашаKZаша». Это ИИ-помощник, а не реальный юрист."}</small></div>
      </div>
      <div className="assistant-process"><span>01 · {isKk ? "Мән-жайлар" : "Обстоятельства"}</span><span>02 · {isKk ? "Заң нормалары" : "Нормы закона"}</span><span>03 · {isKk ? "Әрекет және құжат" : "Действия и документ"}</span></div>
      <p className="assistant-disclaimer">{isKk ? "Жасанды интеллект қате жіберуі мүмкін. Сот нәтижесіне кепілдік бермейді және адвокатпен/заңгермен жеке кеңесуді алмастырмайды." : "ИИ может ошибаться. Ответ не гарантирует исход спора и не заменяет индивидуальную проверку документов юристом."}</p>
    </div>
    <div className="legal-chat">
      <div className="legal-chat-head"><div><span className="chat-status"></span><b>{isKk ? "Отбасы құқығы бойынша AI-көмекші" : "ИИ-ассистент по семейному праву"}</b><small>{isKk ? "Қазақстан Республикасы" : "Республика Казахстан"}</small></div><span className="chat-lock">⌑ {isKk ? "Құпиялылықты сақтаңыз" : "Без лишних персональных данных"}</span></div>
      <div className="legal-chat-body" aria-live="polite">
        {messages.length === 0 && <div className="chat-welcome"><span>§</span><h3>{isKk ? "Сіздің жағдайыңыздан бастайық" : "Начнём с вашей ситуации"}</h3><p>{isKk ? "Мысалы: «Бұрынғы жұбайым баламен кездесуге кедергі жасайды. Қандай құқықтарым бар?»" : "Например: «Бывший супруг препятствует общению с ребёнком. Какие у меня есть права и что можно сделать?»"}</p></div>}
        {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}><span>{message.role === "assistant" ? "§" : (isKk ? "Сіз" : "Вы")}</span><div>{message.content}{message.role === "assistant" && <button className="answer-print" type="button" onClick={() => saveAnswer(message.content)}>{isKk ? "PDF ретінде сақтау / басып шығару" : "Сохранить в PDF / распечатать"}</button>}</div></div>)}
        {busy && <div className="chat-thinking"><span></span><span></span><span></span>{isKk ? "Талдау..." : "Анализирую ситуацию..."}</div>}
      </div>
      <form className="legal-chat-form" onSubmit={send}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder={isKk ? "Жағдайды өз сөзіңізбен жазыңыз..." : "Опишите ситуацию своими словами..."} aria-label={isKk ? "Жағдай сипаттамасы" : "Описание ситуации"} />
        <label className="privacy-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />{isKk ? "ЖСН, мекенжай, телефон және банк деректерін жібермеймін." : "Я не отправляю ИИН, адрес, телефон и банковские данные."}</label>
        {error && <p className="chat-error" role="alert">{error}</p>}
        <div className="chat-form-bottom"><small>{isKk ? "Жіберу арқылы мәтінді талдау үшін серверге жіберуге келісесіз." : "Сообщение будет передано серверу для анализа."}</small><button className="btn btn-primary" disabled={busy || !input.trim()} type="submit">{busy ? (isKk ? "Күтіңіз..." : "Подождите...") : (isKk ? "Жіберу ↑" : "Отправить ↑")}</button></div>
      </form>
      <div className="chat-documents-link"><span>{isKk ? "Құжат үлгілері дайын ба?" : "Нужен готовый образец документа?"}</span><button type="button" onClick={onOpenDocuments}>{isKk ? "Құжаттар бөліміне өту →" : "Перейти в раздел документов →"}</button></div>
    </div>
  </div>;
}
