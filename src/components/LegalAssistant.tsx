import { useState } from "react";
import type { FormEvent } from "react";
import { assistantTextToHtml } from "../utils/assistantFormatting";

type Lang = "ru" | "kk";
type SourceLink = { id: string; title: string; url: string; status: "retrieved" | "unavailable"; checkedAt: string };
type Message = { role: "user" | "assistant"; content: string; sources?: SourceLink[] };

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
        body: JSON.stringify({ messages: next, language, consentAccepted: consent }),
      });
      // Некоторые ошибки платформы (например, Vercel 500/502) возвращают
      // обычный текст или HTML. Не вызываем response.json() вслепую.
      const responseText = await response.text();
      let data: any;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error("Legal assistant returned a non-JSON response:", response.status, responseText.slice(0, 300));
        throw new Error(data?.error ? `${data.error}${data.errorId ? ` Код: ${data.errorId}` : ""}` : (isKk ? `Сервер қатесі (HTTP ${response.status}).` : `Ошибка сервера (HTTP ${response.status}).`));
      }
      if (!response.ok) throw new Error(data.error || (isKk ? "Қызмет уақытша қолжетімсіз." : "Сервис временно недоступен."));
      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error(isKk ? "Жауап алынбады. Қайталап көріңіз." : "Не удалось получить ответ. Попробуйте ещё раз.");
      }
      const sources: SourceLink[] = Array.isArray(data.sources) ? data.sources.filter((source: any) => source && typeof source.title === "string" && typeof source.url === "string" && (source.status === "retrieved" || source.status === "unavailable")) : [];
      const updated: Message[] = [...next, { role: "assistant" as const, content: data.answer, sources }];
      setMessages(updated.slice(-12));
    } catch (err) {
      setMessages(messages);
      setInput(text);
      setError(err instanceof Error ? err.message : (isKk ? "Қате орын алды." : "Произошла ошибка."));
    } finally {
      setBusy(false);
    }
  }

  async function copyAnswer(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setError(isKk ? "Мәтін көшірілді." : "Текст ответа скопирован.");
    } catch {
      setError(isKk ? "Көшіру мүмкін болмады. Мәтінді қолмен белгілеңіз." : "Не удалось скопировать. Выделите текст вручную.");
    }
  }

  function startNewCase() {
    if (busy) return;
    setMessages([]);
    setInput("");
    setError("");
  }

  function saveAnswer(content: string) {
    const printable = '<!doctype html><html lang="' + language + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + (isKk ? "Құқықтық құжат" : "Правовой документ") + '</title><style>@page{size:A4;margin:20mm 15mm 20mm 25mm}body{font:14pt/1.5 "Times New Roman",serif;color:#111}h1,h2,h3{font-size:14pt}p{text-align:justify;margin:0 0 10pt}strong{font-weight:bold}ul,ol{padding-left:24pt}li{margin-bottom:5pt}</style></head><body><h1>' + (isKk ? "Құқықтық құжат" : "Правовой документ") + '</h1>' + assistantTextToHtml(content) + '</body></html>';
    // Печать из iframe не зависит от разрешения всплывающих окон, что особенно важно на мобильных устройствах.
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setError(isKk ? "Басып шығару терезесі ашылды. PDF сақтау үшін принтер тізімінен «PDF ретінде сақтау» таңдаңыз." : "Открылось окно печати. Для сохранения PDF выберите «Сохранить как PDF» в списке принтеров.");
      } catch {
        setError(isKk ? "Басып шығару ашылмады. Браузер мәзірінен «Басып шығару» пәрменін таңдаңыз." : "Не удалось открыть печать. Используйте меню браузера → «Печать».");
      } finally {
        window.setTimeout(() => frame.remove(), 30000);
      }
    };
    document.body.appendChild(frame);
    frame.srcdoc = printable;
  }

  function downloadBlankSample(content: string) {
    const marker = isKk ? "ТОЛТЫРУҒА АРНАЛҒАН ҮЛГІ" : "ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ";
    const markerIndex = content.toUpperCase().indexOf(marker);
    const sampleText = markerIndex >= 0 ? content.slice(markerIndex + marker.length) : content;
    const blank = sampleText.replace(/\[[^\]]+\]/g, "________________________________________");
    const html = '<!doctype html><html lang="' + language + '"><head><meta charset="utf-8"><title>' + (isKk ? "Құжат үлгісі" : "ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ") + '</title><style>@page{size:A4;margin:20mm 15mm 20mm 25mm}body{font:14pt/1.5 "Times New Roman",serif;color:#111}h1,h2,h3{font-size:14pt}p{text-align:justify;margin:0 0 10pt}</style></head><body><h1>' + (isKk ? "Құжат үлгісі" : "ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ") + '</h1>' + assistantTextToHtml(blank) + '</body></html>';
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = isKk ? "qujat-ulgisi.doc" : "obrazec-dlya-skachivaniya.doc";
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
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
        <div><b>{isKk ? "ВИРТУАЛДЫ AI-КӨМЕКШІ" : "ВИРТУАЛЬНЫЙ ИИ-ПОМОЩНИК"}</b><strong>Касенов Бахтияр Бахтиярович</strong><small>{isKk ? "Қазақстан Республикасының отбасы құқығы бойынша виртуалды ИИ-заңгер" : "Виртуальный ИИ-юрист по семейному праву Республики Казахстан"}</small></div>
      </div>
      <div className="assistant-process">
        <span>01 · {isKk ? "Жағдайды талдау" : "Анализ ситуации"}</span>
        <span>02 · {isKk ? "Қолданылатын нормалар" : "Применимые нормы"}</span>
        <span>03 · {isKk ? "Әрекет және құжат" : "Действия и документы"}</span>
      </div>
      
    </div>

    <div className="legal-chat">
      <div className="legal-chat-head">
        <div><span className="chat-status"></span><b>{isKk ? "Отбасы құқығы бойынша AI-көмекші" : "ИИ-ассистент по семейному праву"}</b><small>{isKk ? "Қазақстан Республикасы" : "Законодательство Республики Казахстан"}</small></div>
        <button className="chat-reset" type="button" onClick={startNewCase} disabled={busy}>{isKk ? "Жаңа сұрақ" : "Новый вопрос"}</button>
      </div>
      <div className="legal-chat-body" aria-live="polite">
        {messages.length === 0 && <div className="chat-welcome">
          <span>§</span><h3>{welcomeTitle}</h3><p className="assistant-greeting">{isKk ? "Сәлеметсіз бе! Мен — Бахтияр Бахтиярович Касенов, «Право Семьи» платформасының виртуалды заңгерімін." : "Здравствуйте! Я Касенов Бахтияр Бахтиярович, виртуальный юрист платформы «Право Семьи»."}</p><p>{welcomeText}</p>
          <div className="chat-suggestions-label">{isKk ? "НЕМЕСЕ ТАҚЫРЫПТЫ ТАҢДАҢЫЗ" : "ИЛИ ВЫБЕРИТЕ ТЕМУ"}</div>
          <div className="chat-suggestions">{prompts[language].map((prompt) => <button type="button" key={prompt} onClick={() => { setInput(prompt); setError(""); }}>{prompt}<span>↗</span></button>)}</div>
        </div>}
        {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}>
          <span>{message.role === "assistant" ? "§" : (isKk ? "Сіз" : "Вы")}</span>
          <div>{message.role === "assistant" ? <div className="assistant-rich-text" dangerouslySetInnerHTML={{ __html: assistantTextToHtml(message.content) }} /> : message.content}{message.role === "assistant" && <>
            <div className="answer-actions">
              <button className="answer-print" type="button" onClick={() => saveAnswer(message.content)}>{isKk ? "PDF ретінде сақтау / басып шығару" : "Сохранить в PDF / распечатать"}</button>
              {/(ПРОЕКТ ДОКУМЕНТА|ЖОБА ҚҰЖАТ|ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ|ТОЛТЫРУҒА АРНАЛҒАН ҮЛГІ)/i.test(message.content) && <button className="answer-print answer-download-sample" type="button" onClick={() => downloadBlankSample(message.content)}>{isKk ? "Жүктеп алуға арналған үлгі" : "ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ"}</button>}
              <button className="answer-print" type="button" onClick={() => copyAnswer(message.content)}>{isKk ? "Көшіру" : "Скопировать"}</button>
            </div>
            {message.sources && <div className="chat-sources">
              <b>{isKk ? "РЕСМИ ҚҰҚЫҚТЫҚ ДЕРЕККӨЗДЕР" : "ОФИЦИАЛЬНЫЕ ПРАВОВЫЕ ИСТОЧНИКИ"}</b>
              {message.sources.map(source => <div className="chat-source" key={source.id}>
                <span className={source.status === "retrieved" ? "source-indicator available" : "source-indicator unavailable"}></span>
                <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                <small>{source.status === "retrieved"
                  ? (isKk ? "Мәтін сервер арқылы алынды · " : "Текст получен сервером · ") + new Date(source.checkedAt).toLocaleString(isKk ? "kk-KZ" : "ru-RU")
                  : (isKk ? "Мәтінді алу мүмкін болмады; сілтеме қолжетімді." : "Не удалось получить текст; ссылка доступна для проверки.")}</small>
              </div>)}
              {message.sources.length > 0 && message.sources.every(source => source.status !== "retrieved") && <p className="source-warning">{isKk ? "Бұл жауап ресми мәтіннен алынған үзінділермен расталмады. Маңызды нормаларды Әділет жүйесінен қолмен тексеріңіз." : "Этот ответ не удалось подтвердить извлечёнными фрагментами официального текста. Проверьте важные нормы непосредственно в ИПС «Әділет»."}</p>}
            </div>}
          </>}</div>
        </div>)}
        {busy && <div className="chat-thinking"><span></span><span></span><span></span>{isKk ? "Жағдай мен құқықтық нормаларды талдау..." : "Анализирую обстоятельства и правовые нормы..."}</div>}
      </div>
      <form className="legal-chat-form" onSubmit={send}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} maxLength={4000} placeholder={isKk ? "Жағдайды өз сөзіңізбен жазыңыз..." : "Опишите ситуацию своими словами..."} aria-label={isKk ? "Жағдай сипаттамасы" : "Описание ситуации"} />
        <label className="privacy-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />{isKk ? "Пайдаланушы келісімімен таныстым және оны қабылдаймын." : "Я ознакомился с пользовательским соглашением и принимаю его."}</label>
        <details className="user-terms"><summary>{isKk ? "Пайдаланушы келісімін оқу" : "Прочитать пользовательское соглашение"}</summary>
          {isKk ? <div><p>Сервис — отбасылық құқық мәселелерін түсіндіруге және құжат жобаларын дайындауға арналған виртуалды ИИ-құрал. Ол адвокат, нотариус немесе мемлекеттік орган емес және адвокат пен клиент арасындағы қатынастарды құрмайды.</p><p>Хабарламалар Google Gemini API арқылы өңделеді. Сұрауларды өңдеу үшінші тарап инфрақұрылымы пайдаланылады; Google-дың деректерді өңдеу шарттары мен құпиялылық саясаты қолданылады.</p><p>Жауаптар алдын ала ақпараттық сипатта болады. ЖИ қателесуі немесе маңызды мән-жайларды ескермеуі мүмкін. Қолданылатын нормаларды, олардың редакциясын, мерзімдер мен рәсімдерді «Әділет» жүйесіндегі қолданыстағы заңнамамен тексеріңіз.</p><p>Сервис сот шешіміне кепілдік бермейді және заң көмегін көрсету туралы шарт болып табылмайды. ЖСН, құжаттардың толық көшірмелерін, нақты мекенжайды, телефонды, банк деректерін, парольдерді және балаларды сәйкестендіретін мәліметтерді енгізбеңіз.</p><p>Белгі қою арқылы пайдаланушы осы шарттарды қабылдайды және хабарламаларын сыртқы ИИ-провайдеріне өңдеуге жіберуге келіседі.</p></div> : <div><p>Сервис — семейно-правовой виртуальный ИИ-инструмент для объяснения правовых вопросов и подготовки проектов документов. Он не является адвокатом, нотариусом или государственным органом и не создаёт отношений «адвокат — клиент».</p><p>Сообщения передаются Google Gemini API для обработки. Для обработки запросов используется инфраструктура внешнего поставщика; применяются условия обработки данных и политика конфиденциальности Google.</p><p>Ответы носят предварительный информационный характер. ИИ может ошибаться или упускать существенные обстоятельства. Применимые нормы, их редакцию, сроки и процедуры необходимо сверять с действующим законодательством в ИПС «Әділет».</p><p>Сервис не гарантирует исход судебного дела и не является договором об оказании юридической помощи. Не вводите ИИН, полные копии документов, точный адрес, телефон, банковские реквизиты, пароли и данные, позволяющие идентифицировать детей.</p><p>Устанавливая отметку, пользователь принимает условия соглашения и соглашается на передачу сообщений внешнему ИИ-провайдеру для обработки.</p></div>}
        </details>
        {error && <p className="chat-error" role="alert">{error}</p>}
        <div className="chat-form-bottom"><small>{isKk ? "Gemini арқылы өңделеді." : "Обработка: Google Gemini."}</small>
          <button className="btn btn-primary" disabled={busy || !input.trim()} type="submit">{busy ? (isKk ? "Талдау..." : "Анализ...") : (isKk ? "Жіберу ↑" : "Отправить ↑")}</button>
        </div>
      </form>
      <div className="chat-documents-link"><span>{isKk ? "Құжат дайындау немесе үлгіні табу керек пе?" : "Нужно подготовить документ или найти образец?"}<br/><small>{isKk ? "Сәйкес құжатты таңдау үшін кітапхананы ашыңыз." : "Откройте библиотеку, чтобы посмотреть доступные формы."}</small></span>
        <button type="button" onClick={onOpenDocuments}>{isKk ? "Құжаттар бөлімі →" : "Библиотека документов →"}</button>
      </div>
    </div>
  </div>;
}
