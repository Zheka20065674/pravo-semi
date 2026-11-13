import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const data = readFileSync("src/data/documentRequirements.ts", "utf8");

const dictionaryStart = app.indexOf("const kkLegalText");
const dictionaryEnd = app.indexOf("const kkUi", dictionaryStart);
if (dictionaryStart < 0 || dictionaryEnd < 0) {
  throw new Error("Could not locate the Kazakh legal-text dictionary in src/App.tsx.");
}
const dictionary = app.slice(dictionaryStart, dictionaryEnd);
const decode = (value) => JSON.parse(`"${value}"`);
const translatedKeys = new Set(
  [...dictionary.matchAll(/"((?:\\.|[^"\\])*)"\\s*:/g)].map((match) => decode(match[1])),
);

const requiredStrings = new Set();
const addMatches = (source, pattern) => {
  for (const match of source.matchAll(pattern)) requiredStrings.add(decode(match[1]));
};

// User-facing labels and explanations in the legal-document registry.
addMatches(data, /(?:title|category|purpose|label|explanation):\\s*"((?:\\.|[^"\\])*)"/g);

// Limitations are also displayed to users and must not fall back to Russian.
for (const match of data.matchAll(/limitations:\\s*\\[([\\s\\S]*?)\\]/g)) {
  addMatches(match[1], /"((?:\\.|[^"\\])*)"/g);
}

// The research queue is visible in the document catalogue.
const queueStart = data.indexOf("export const documentResearchQueue");
if (queueStart >= 0) {
  addMatches(data.slice(queueStart), /(?:title|status):\\s*"((?:\\.|[^"\\])*)"/g);
}

const missing = [...requiredStrings].filter((value) => !translatedKeys.has(value));
if (missing.length) {
  console.error("Missing Kazakh translations for document content:");
  for (const value of missing) console.error(` - ${value}`);
  process.exitCode = 1;
} else {
  console.log(`Kazakh localization audit passed: ${requiredStrings.size} document strings have translations.`);
}
