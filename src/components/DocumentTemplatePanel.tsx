import { useMemo, useState } from "react";
import type { DocumentTemplate } from "../data/documentTemplates";

type Props = { template: DocumentTemplate; isKk: boolean; onClose: () => void };
type PreviewMode = "annotated" | "blank" | "example";

function blankField(label: string): string {
  const value = label.toLowerCase();
  if (/адрес|мекенжай|документ|реквизит|кадастр|свидетельств|паспорт|удостовер/.test(value)) {
    return "____________________________________________________________\n____________________________________________________________";
  }
  if (/иин|жсн/.test(value)) return "________________";
  if (/дата|күні|число|срок|мерзім/.test(value)) return "________________________";
  if (/фио|т\\.а\\.ә|фамил|имя|аты-жөн|полностью/.test(value)) return "____________________________________________";
  if (/сумм|размер|доля|үлес|тенге|процент/.test(value)) return "____________________________";
  if (/указать|описать|услов|шарт|режим|основан|сипат|перечень|тізбе|причин/.test(value)) {
    return "____________________________________________________________\n____________________________________________________________";
  }
  return "____________________________________________";
}

function makeBlank(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, (_match, label: string) => blankField(label));
}

function exampleField(label: string, isKk: boolean): string {
  const value = label.toLowerCase();
  const ru = (text: string) => isKk ? text : text;
  if (/апелляцион|апелляциялық/.test(value)) return isKk ? "Астана қалалық сотының азаматтық істер жөніндегі сот алқасына" : "В судебную коллегию по гражданским делам суда города Астаны";
  if (/наименование суда|соттың атауы/.test(value)) return isKk ? "Астана қаласының ауданаралық азаматтық сотына" : "В районный суд города Астаны";
  if (/истц|талап қоюшы|жүгінуші/.test(value)) return "Петров Пётр Петрович";
  if (/ответч|жауапкер/.test(value)) return "Сергеев Сергей Сергеевич";
  if (/реб[её]н|баланың|баланы/.test(value)) return "Макарова Марина Макаровна";
  if (/фио|т\\.а\\.ә|фамил|имя|аты-жөн|полностью|т\\.а\\.ә/.test(value)) return "Петров Пётр Петрович";
  if (/иин|жсн/.test(value)) return "000000000000 (условный учебный номер, недействителен)";
  if (/дата рождения/.test(value)) return "12.06.2014";
  if (/дата|күні|число|срок|мерзім/.test(value)) return "15.03.2026";
  if (/адрес|мекенжай/.test(value)) return isKk ? "Астана қ., Үлгі көшесі, 10-үй, 5-пәтер (ойдан шығарылған мекенжай)" : "г. Астана, ул. Учебная, д. 10, кв. 5 (вымышленный адрес)";
  if (/удостовер|жеке куәлік|документ|реквизит|свидетельств|паспорт/.test(value)) return isKk ? "Жеке куәлік: DEMO-000001, 01.02.2024 ж. берілген, үлгілік орган (жарамсыз оқу деректері)" : "удостоверение личности: DEMO-000001, выдано 01.02.2024 условным органом (недействительные учебные реквизиты)";
  if (/иин|жсн/.test(value)) return "000000000000 (недействительный учебный номер)";
  if (/телефон|нөмір|контакт|байланыс/.test(value)) return "+7 700 000 00 00 (учебный номер)";
  if (/email|электрондық пошта/.test(value)) return "example@example.invalid";
  if (/сумм|тенге|стоим|құны/.test(value)) return "18 500 000 (восемнадцать миллионов пятьсот тысяч) тенге";
  if (/номер дела|іс нөмірі/.test(value)) return "2-1234-26";
  if (/номер|нөмір/.test(value)) return "№ 15/2024";
  if (/населённый пункт|елді мекен/.test(value)) return "Астана";
  if (/орган|ахат|рагс/.test(value)) return isKk ? "Астана қаласының азаматтық хал актілерін тіркеу бөлімі" : "Отдел регистрации актов гражданского состояния города Астаны";
  if (/кадастр/.test(value)) return "условный кадастровый номер DEMO-KZ-0001 (не существует)";
  if (/vin/.test(value)) return "DEMO-VIN-0000000000001 (не является действительным VIN)";
  if (/марка|модель|көлік/.test(value)) return "Toyota Camry, 2018 года выпуска, условный госномер DEMO 001";
  if (/недвижим|квартира|жылжымайтын/.test(value)) return "квартира: г. Астана, ул. Учебная, д. 10, кв. 5; 62 м²; приобретена в 2021 году; условная стоимость 24 000 000 тенге";
  if (/доля|үлес|процент/.test(value)) return "1/2 (50 %)";
  if (/график|период|кезең|апта|дни недели/.test(value)) return isKk ? "әр аптаның сенбі және жексенбі күндері, сағат 10:00-ден 18:00-ге дейін" : "каждую субботу и воскресенье с 10:00 до 18:00";
  if (/iban|банк/.test(value)) return "KZ00DEMO000000000000 (условный реквизит, не банковский счёт)";
  if (/источник|дереккөзі/.test(value)) return "договор купли-продажи от 10.05.2021, условный документ";
  if (/причин|обстоятельств|мән-жай/.test(value)) return isKk ? "2025 жылғы қаңтардан бастап тараптар бөлек тұрады; татуласу туралы келіссөздер нәтиже бермеді. Бұл — тек оқу мысалы." : "С января 2025 года стороны проживают раздельно; попытки договориться о примирении результата не дали. Это только учебный пример.";
  if (/характеристик|условия жилья|тұрғын үй/.test(value)) return isKk ? "пәтер екі бөлмелі, баланың жеке ұйықтайтын орны, оқу үстелі бар; үйде анасы және бала тұрады (оқу мысалы)" : "двухкомнатная квартира; у ребёнка есть отдельное спальное место и письменный стол; совместно проживают мать и ребёнок (учебный пример)";
  if (/доказательств|дәлелдеме|подтверждени/.test(value)) return isKk ? "баланың туу туралы куәлігі, мектеп анықтамасы, тұрғын үй құжаттары және тараптардың хат алмасуы (шартты мысал)" : "свидетельство о рождении ребёнка, справка из школы, документы на жильё и переписка сторон (условный пример)";
  if (/признать|оспорить|талапты көрсету/.test(value)) return isKk ? "талаптың 1-тармағын мойындаймын, қалған бөлігін ұсынылған дәлелдемелерге байланысты даулауға қалдырамын" : "требование в части обстоятельств регистрации брака признаю; остальные требования оцениваются по представленным доказательствам";
  if (/плательщик/.test(value)) return "Сергеев Сергей Сергеевич";
  if (/получатель/.test(value)) return "Макарова Марина Макаровна в лице законного представителя Петровой Анны Викторовны";
  if (/описать|указать|услов|шарт|режим|основан|перечень|тізбе|сипат|қысқаша|нақты/.test(value)) return isKk ? "Мысал: тараптар пәтерді тең үлеспен бөлуді, ал Toyota Camry автокөлігін бір тарапқа беріп, екінші тарапқа ақшалай өтемақы төлеуді келісті. Бұл — ойдан шығарылған оқу жағдайы." : "Пример: стороны договорились разделить квартиру поровну, а автомобиль Toyota Camry передать одному супругу с выплатой второму денежной компенсации. Это вымышленная учебная ситуация.";
  return isKk ? "Оқу мақсатындағы шартты дерек: тараптар нақты құжаттармен расталатын мән-жайларды көрсетеді." : "Условные учебные сведения: стороны указывают обстоятельства, подтверждаемые конкретными документами.";
}
function makeExample(text: string, isKk: boolean): string {
  return text.replace(/\[([^\]]+)\]/g, (_match, label: string) => exampleField(label, isKk));
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph) { result.push(""); continue; }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        result.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) result.push(line);
  }
  return result;
}

export default function DocumentTemplatePanel({ template, isKk, onClose }: Props) {
  const [mode, setMode] = useState<PreviewMode>("annotated");
  const original = isKk ? template.kk : template.ru;
  const copy = useMemo(() => {
    if (mode === "blank") return {
      ...original,
      title: makeBlank(original.title),
      subtitle: makeBlank(original.subtitle),
      clauses: original.clauses.map((clause) => ({ ...clause, text: makeBlank(clause.text) })),
    };
    if (mode === "example") return {
      ...original,
      title: makeExample(original.title, isKk),
      subtitle: makeExample(original.subtitle, isKk),
      clauses: original.clauses.map((clause) => ({ ...clause, heading: makeExample(clause.heading, isKk), text: makeExample(clause.text, isKk) })),
    };
    return original;
  }, [mode, original, isKk]);
  const isBlank = mode === "blank";
  const isExample = mode === "example";

  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    const width = 1240;
    const margin = 100;
    const textWidth = width - margin * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drawLines: { text: string; font: string; height: number; gap: number }[] = [];
    const add = (text: string, font: string, height: number, gap = 0) => {
      ctx.font = font;
      for (const line of wrapText(ctx, text, textWidth)) drawLines.push({ text: line, font, height, gap });
    };
    add(copy.title, isExample ? "bold 34px 'Segoe Print', 'Bradley Hand', cursive" : "bold 34px 'Times New Roman'", 48, 18);
    add(copy.subtitle, isExample ? "28px 'Segoe Print', 'Bradley Hand', cursive" : "28px 'Times New Roman'", 38, 30);
    for (const clause of copy.clauses) {
      add(clause.heading, isExample ? "bold 28px 'Segoe Print', 'Bradley Hand', cursive" : "bold 28px 'Times New Roman'", 40, 10);
      add(clause.text, isExample ? "28px 'Segoe Print', 'Bradley Hand', cursive" : "28px 'Times New Roman'", 39, 22);
    }
    const height = Math.max(1754, margin * 2 + drawLines.reduce((sum, line) => sum + line.height + line.gap, 0));
    canvas.width = width;
    canvas.height = height;
    const paint = canvas.getContext("2d");
    if (!paint) return;
    paint.fillStyle = "#ffffff";
    paint.fillRect(0, 0, width, height);
    let y = margin;
    for (const line of drawLines) {
      paint.font = line.font;
      paint.fillStyle = isExample ? "#174d91" : "#111111";
      paint.fillText(line.text, margin, y);
      y += line.height + line.gap;
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = template.id + (isBlank ? "-blank-form" : isExample ? "-filled-example" : "-annotated-sample") + ".png";
      anchor.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const printDocument = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.alert(isKk ? "Басып шығару терезесін ашуға рұқсат беріңіз." : "Разрешите открытие окна для печати документа.");
      return;
    }
    const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] ?? char));
    const clauses = copy.clauses.map((clause) => `<section><h2>${escapeHtml(clause.heading)}</h2><p>${escapeHtml(clause.text)}</p></section>`).join("");
    const title = escapeHtml(copy.title);
    const subtitle = escapeHtml(copy.subtitle);
    printWindow.document.write(`<!doctype html><html lang="${isKk ? "kk" : "ru"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>
      @page{size:A4;margin:10mm 10mm 10mm 20mm}
      *{box-sizing:border-box}
      body{font-family:"Times New Roman",serif;font-size:14pt;line-height:1;color:#111;margin:0}
      body.example,body.example h1,body.example h2,body.example p{font-family:"Segoe Print","Bradley Hand","Comic Sans MS",cursive;color:#174d91;line-height:1.5}
      h1{font-size:14pt;font-weight:bold;text-align:center;margin:0 0 8mm}
      .subtitle{white-space:pre-wrap;margin:0 0 7mm;text-align:left}
      section{break-inside:avoid;margin:0 0 5mm}
      h2{font-size:14pt;font-weight:bold;margin:0 0 2mm;text-align:left}
      p{white-space:pre-wrap;text-align:justify;text-indent:12.5mm;margin:0}
      .blank p{line-height:1.35}
      .page-number{position:fixed;bottom:-5mm;right:0;font-size:10pt}
      @media screen{body{max-width:210mm;margin:15px auto;padding:20mm 10mm 10mm 20mm;background:white;box-shadow:0 2px 18px #0002}}
    </style></head><body class="${isBlank ? "blank" : isExample ? "example" : "annotated"}"><h1>${title}</h1><p class="subtitle">${subtitle}</p>${clauses}<script>window.onload=()=>window.print()<\\/script></body></html>`);
    printWindow.document.close();
  };

  const heading = isKk ? "Құжат үлгісі" : "Образец документа";
  const annotatedLabel = isKk ? "РӘСІМДЕУ ҮЛГІСІ" : "ОБРАЗЕЦ ОФОРМЛЕНИЯ";
  const exampleLabel = isKk ? "ТОЛТЫРЫЛҒАН МЫСАЛ" : "ПРИМЕР ОФОРМЛЕНИЯ";
  const blankLabel = isKk ? "ТОЛТЫРУҒА АРНАЛҒАН ҮЛГІ" : "ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ";
  const downloadImageLabel = isKk ? "PNG суретін жүктеу" : "Скачать изображение (PNG)";
  const downloadPdfLabel = isKk ? "PDF ретінде сақтау" : "Сохранить в PDF";
  const note = isKk
    ? "Бірінші нұсқада толтыруға арналған түсіндірмелер, екіншісінде бос жолдар, үшіншісінде шартты деректермен толтырылған оқу мысалы көрсетіледі. PDF алу үшін басып шығару терезесінде «PDF ретінде сақтау» тармағын таңдаңыз."
    : "Первый вариант содержит подсказки, второй — чистый бланк, третий — учебный пример с условными данными. Для PDF в окне печати выберите «Сохранить как PDF».";
  const fillingNote = isKk ? "Оқу мысалындағы барлық аты-жөндер мен деректемелер ойдан шығарылған; ЖСН, құжат және банк нөмірлері жарамсыз. Нақты құжатқа көшірмеңіз." : "Все ФИО и реквизиты в учебном примере вымышлены; ИИН, номера документов и банковские данные недействительны. Не используйте их в реальных документах.";

  return <section className="doc-template-panel" aria-live="polite">
    <div className="doc-template-top">
      <div><p className="eyebrow">{heading}</p><h3>{template.title}</h3><p>{original.subtitle}</p></div>
      <button type="button" className="btn btn-outline" onClick={onClose}>{isKk ? "Жабу" : "Закрыть"}</button>
    </div>
    <div className="doc-template-warning">{isKk ? template.warningKk : template.warning}</div>
    <div className="doc-template-mode" role="group" aria-label={isKk ? "Құжат нұсқасын таңдау" : "Выбор варианта документа"}>
      <button type="button" className={mode === "annotated" ? "active" : ""} aria-pressed={mode === "annotated"} onClick={() => setMode("annotated")}>{annotatedLabel}</button>
      <button type="button" className={mode === "blank" ? "active" : ""} aria-pressed={mode === "blank"} onClick={() => setMode("blank")}>{blankLabel}</button>
      <button type="button" className={`doc-template-example-button ${mode === "example" ? "active" : ""}`} aria-pressed={mode === "example"} onClick={() => setMode("example")}>{exampleLabel}</button>
    </div>
    <div className="doc-template-actions">
      <button type="button" className="btn btn-primary" onClick={downloadImage}>{downloadImageLabel}</button>
      <button type="button" className="btn btn-outline" onClick={printDocument}>{downloadPdfLabel}</button>
    </div>
    <p className="doc-template-hint">{note}</p>
    <article className={`document-paper ${isBlank ? "document-paper-blank" : ""} ${isExample ? "document-paper-example" : ""}`}>
      <h2>{copy.title}</h2>
      <p className="document-paper-subtitle">{copy.subtitle}</p>
      {copy.clauses.map((clause, index) => <section key={index}><h3>{clause.heading}</h3><p>{clause.text}</p></section>)}
    </article>
    {copy.closing && <p className="doc-template-hint doc-template-closing-note">{copy.closing}</p>}
    <p className="doc-template-hint doc-template-filling-note">{fillingNote}</p>
    <div className="doc-template-sources">
      <b>{isKk ? "Ресми құқықтық дереккөздер" : "Официальные правовые источники"}</b>
      {template.sources.map((source) => <a key={source.url + source.label} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
    </div>
  </section>;
}
