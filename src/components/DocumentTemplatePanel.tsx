import { useMemo } from "react";
import type { DocumentTemplate } from "../data/documentTemplates";

type Props = { template: DocumentTemplate; isKk: boolean; onClose: () => void };

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
  const copy = isKk ? template.kk : template.ru;
  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    const width = 1240;
    const margin = 90;
    const textWidth = width - margin * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drawLines: { text: string; font: string; height: number; gap: number }[] = [];
    const add = (text: string, font: string, height: number, gap = 0) => {
      ctx.font = font;
      for (const line of wrapText(ctx, text, textWidth)) drawLines.push({ text: line, font, height, gap });
    };
    add(copy.title, "bold 34px Georgia", 48, 18);
    add(copy.subtitle, "22px Georgia", 34, 30);
    for (const clause of copy.clauses) {
      add(clause.heading, "bold 25px Georgia", 36, 10);
      add(clause.text, "22px Georgia", 34, 22);
    }
    add(copy.closing, "italic 19px Georgia", 30, 20);
    const height = margin * 2 + drawLines.reduce((sum, line) => sum + line.height + line.gap, 0);
    canvas.width = width;
    canvas.height = height;
    const paint = canvas.getContext("2d");
    if (!paint) return;
    paint.fillStyle = "#ffffff";
    paint.fillRect(0, 0, width, height);
    let y = margin;
    for (const line of drawLines) {
      paint.font = line.font;
      paint.fillStyle = "#172b3b";
      paint.fillText(line.text, margin, y);
      y += line.height + line.gap;
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = template.id + "-obrazets.png";
      anchor.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  const printDocument = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      window.alert(isKk ? "Басып шығару терезесін ашуға рұқсат беріңіз." : "Разрешите открытие окна для печати документа.");
      return;
    }
    const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] ?? char));
    const clauses = copy.clauses.map((clause) => `<section><h2>${escapeHtml(clause.heading)}</h2><p>${escapeHtml(clause.text).replace(/\n/g, "<br>")}</p></section>`).join("");
    printWindow.document.write(`<!doctype html><html lang="${isKk ? "kk" : "ru"}"><head><meta charset="utf-8"><title>${escapeHtml(copy.title)}</title><style>
      @page{size:A4;margin:20mm}body{font:12pt/1.5 "Times New Roman",serif;color:#111}h1{text-align:center;font-size:16pt;margin:0 0 8mm}h2{font-size:12pt;margin:7mm 0 2mm}p{white-space:normal;margin:0;text-align:justify}.subtitle{white-space:pre-line;margin-bottom:8mm}.closing{margin-top:9mm;font-style:italic;font-size:10pt}.draft{margin-bottom:8mm;padding:3mm;border:1px solid #999;font-size:9pt}
      </style></head><body><div class="draft">${escapeHtml(template.warning)}</div><h1>${escapeHtml(copy.title)}</h1><p class="subtitle">${escapeHtml(copy.subtitle)}</p>${clauses}<p class="closing">${escapeHtml(copy.closing)}</p><script>window.onload=()=>window.print()<\/script></body></html>`);
    printWindow.document.close();
  };
  const heading = isKk ? "Үлгі құжат" : "Образец документа";
  const downloadImageLabel = isKk ? "Сурет ретінде жүктеу (PNG)" : "Скачать изображение (PNG)";
  const downloadPdfLabel = isKk ? "PDF ретінде сақтау" : "Сохранить в PDF";
  const note = isKk
    ? "PDF файлын алу үшін ашылған басып шығару терезесінде «PDF ретінде сақтау» тармағын таңдаңыз."
    : "Для получения PDF в открывшемся окне печати выберите «Сохранить как PDF».";
  return <section className="doc-template-panel" aria-live="polite">
    <div className="doc-template-top">
      <div><p className="eyebrow">{heading}</p><h3>{template.title}</h3><p>{isKk ? template.kk.subtitle : template.ru.subtitle}</p></div>
      <button type="button" className="btn btn-outline" onClick={onClose}>{isKk ? "Жабу" : "Закрыть"}</button>
    </div>
    <div className="doc-template-warning">{template.warning}</div>
    <div className="doc-template-actions">
      <button type="button" className="btn btn-primary" onClick={downloadImage}>{downloadImageLabel}</button>
      <button type="button" className="btn btn-outline" onClick={printDocument}>{downloadPdfLabel}</button>
    </div>
    <p className="doc-template-hint">{note}</p>
    <article className="document-paper">
      <h2>{copy.title}</h2>
      <p className="document-paper-subtitle">{copy.subtitle}</p>
      {copy.clauses.map((clause, index) => <section key={index}><h3>{clause.heading}</h3><p>{clause.text}</p></section>)}
      <p className="document-paper-closing">{copy.closing}</p>
    </article>
    <div className="doc-template-sources">
      <b>{isKk ? "Ресми құқықтық дереккөздер" : "Официальные правовые источники"}</b>
      {template.sources.map((source) => <a key={source.url + source.label} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
    </div>
  </section>;
}
