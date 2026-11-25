import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const data = readFileSync("src/data/documentRequirements.ts", "utf8");

// The site now keeps Kazakh interface copy in kkUi and topic/card translations
// in topicsKk / translateCardText. The old kkLegalText dictionary was removed
// during the interface redesign, so do not require that obsolete symbol.
const requiredLocalizationStructures = [
  ["Kazakh UI dictionary", /const\\s+kkUi\\s*=\\s*\\{/],
  ["Kazakh topic translations", /const\\s+topicsKk\\s*:/],
  ["Document-card translation function", /function\\s+translateCardText\\s*\\(/],
];

const missingStructures = requiredLocalizationStructures
  .filter(([, pattern]) => !pattern.test(app))
  .map(([label]) => label);

if (missingStructures.length) {
  console.error("Localization audit failed. Missing current localization structures:");
  for (const label of missingStructures) console.error(" - " + label);
  process.exitCode = 1;
} else {
  const documentCount = (data.match(/\\bid:\\s*"/g) || []).length;
  console.log("Localization structure audit passed: Kazakh UI, topic translations and document-card translation function found.");
  console.log("Document registry records inspected: " + documentCount);
}
