import { useMemo, useState } from "react";
import type { DocumentTemplate } from "../data/documentTemplates";

type Props = { template: DocumentTemplate; isKk: boolean; onClose: () => void };
type PreviewMode = "annotated" | "blank";

function blankField(label: string): string {
  const value = label.toLowerCase();
  if (/иин|жсн/.test(value)) return "________________";
  if (/дата|күні|число|срок|мерзім/.test(value)) return "________________________";
  if (/фио|т\.а\.ә|фамил|имя|аты-жөн|полностью/.test(value)) return "____________________________________________";
  if (/адрес|мекенжай/.test(value)) return "____________________________________________________________";
  if (/документ|реквизит|номер|нөмір|орган|банк|iban|кадастр|vin|свидетельств/.test(value)) return "____________________________________________________________";
  if (/сумм|размер|доля|үлес|тенге|процент/.test(value)) return "____________________________";
  if (/указать|описать|услов|шарт|режим|основан|сипат|перечень|тізбе|причин/.test(value)) {
    return "____________________________________________________________\n____________________________________________________________";
  }
  return "____________________________________________";
}

function makeBlank(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, (_match, label: string) => blankField(label));
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
  const copy = useMemo(() => mode === "blank" ? {
    ...original,
    subtitle: makeBlank(original.subtitle),
    clauses: original.clauses.map((clause) => ({ ...clause, text: makeBlank(clause.text) })),
  } : original, [mode, original]);
  const isBlank = mode === "blank";

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
    add(copy.title, "bold 34px 'Times New Roman'", 48, 18);
    add(copy.subtitle, "28px 'Times New Roman'", 38, 30);
    for (const clause of copy.clauses) {
      add(clause.heading, "bold 28px 'Times New Roman'", 40, 10);
      add(clause.text, "28px 'Times New Roman'", 39, 22);
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
      paint.fillStyle = "#111111";
      paint.fillText(line.text, margin, y);
      y += line.height + line.gap;
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = template.id + (isBlank ? "-blank-form" : "-annotated-sample") + ".png";
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
      h1{font-size:14pt;font-weight:bold;text-align:center;margin:0 0 8mm}
      .subtitle{white-space:pre-wrap;margin:0 0 7mm;text-align:left}
      section{break-inside:avoid;margin:0 0 5mm}
      h2{font-size:14pt;font-weight:bold;margin:0 0 2mm;text-align:left}
      p{white-space:pre-wrap;text-align:justify;text-indent:12.5mm;margin:0}
      .blank p{line-height:1.35}
      .page-number{position:fixed;bottom:-5mm;right:0;font-size:10pt}
      @media screen{body{max-width:210mm;margin:15px auto;padding:20mm 10mm 10mm 20mm;background:white;box-shadow:0 2px 18px #0002}}
    </style></head><body class="${isBlank ? "blank" : "annotated"}"><h1>${title}</h1><p class="subtitle">${subtitle}</p>${clauses}<script>window.onload=()=>window.print()<\\/script></body></html>`);
    printWindow.document.close();
  };

  const heading = isKk ? "Құжат үлгісі" : "Образец документа";
  const annotatedLabel = isKk ? "РӘСІМДЕУ ҮЛГІСІ" : "ОБРАЗЕЦ ОФОРМЛЕНИЯ";
  const blankLabel = isKk ? "ТОЛТЫРУҒА АРНАЛҒАН ҮЛГІ" : "ОБРАЗЕЦ ДЛЯ СКАЧИВАНИЯ";
  const downloadImageLabel = isKk ? "PNG суретін жүктеу" : "Скачать изображение (PNG)";
  const downloadPdfLabel = isKk ? "PDF ретінде сақтау" : "Сохранить в PDF";
  const note = isKk
    ? "Алғашқы нұсқада толтыруға арналған түсіндірмелер көрсетіледі. Екінші нұсқада деректерді қолмен енгізуге арналған бос жолдар беріледі. PDF алу үшін басып шығару терезесінде «PDF ретінде сақтау» тармағын таңдаңыз."
    : "В первом варианте показаны подсказки, что именно вписывать. Во втором — пустые линии с местом для заполнения от руки. Для PDF в окне печати выберите «Сохранить как PDF».";
  const fillingNote = isKk ? "Ескерту: шаршы жақшадағы нұсқаулар құжаттың мәтініне кірмейді." : "Подсказки в квадратных скобках предназначены только для ознакомления и не являются условиями договора.";

  return <section className="doc-template-panel" aria-live="polite">
    <div className="doc-template-top">
      <div><p className="eyebrow">{heading}</p><h3>{template.title}</h3><p>{original.subtitle}</p></div>
      <button type="button" className="btn btn-outline" onClick={onClose}>{isKk ? "Жабу" : "Закрыть"}</button>
    </div>
    <div className="doc-template-warning">{isKk ? template.warningKk : template.warning}</div>
    <div className="doc-template-mode" role="group" aria-label={isKk ? "Құжат нұсқасын таңдау" : "Выбор варианта документа"}>
      <button type="button" className={mode === "annotated" ? "active" : ""} aria-pressed={mode === "annotated"} onClick={() => setMode("annotated")}>{annotatedLabel}</button>
      <button type="button" className={mode === "blank" ? "active" : ""} aria-pressed={mode === "blank"} onClick={() => setMode("blank")}>{blankLabel}</button>
    </div>
    <div className="doc-template-actions">
      <button type="button" className="btn btn-primary" onClick={downloadImage}>{downloadImageLabel}</button>
      <button type="button" className="btn btn-outline" onClick={printDocument}>{downloadPdfLabel}</button>
    </div>
    <p className="doc-template-hint">{note}</p>
    <article className={`document-paper ${isBlank ? "document-paper-blank" : ""}`}>
      <h2>{copy.title}</h2>
      <p className="document-paper-subtitle">{copy.subtitle}</p>
      {copy.clauses.map((clause, index) => <section key={index}><h3>{clause.heading}</h3><p>{clause.text}</p></section>)}
    </article>
    <p className="doc-template-hint doc-template-filling-note">{fillingNote}</p>
    <div className="doc-template-sources">
      <b>{isKk ? "Ресми құқықтық дереккөздер" : "Официальные правовые источники"}</b>
      {template.sources.map((source) => <a key={source.url + source.label} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
    </div>
  </section>;
}
