import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const data = readFileSync("src/data/documentRequirements.ts", "utf8");

// Validate the current localization structures by their literal source markers.
// This avoids fragile regular-expression escaping in the build environment.
const requiredMarkers = [
  ["Kazakh UI dictionary", "const kkUi = {"],
  ["Kazakh topic translations", "const topicsKk:"],
  ["Document-card translation function", "function translateCardText("],
];

const missingStructures = requiredMarkers
  .filter(([, marker]) => !app.includes(marker))
  .map(([label]) => label);

if (missingStructures.length) {
  console.error("Localization audit failed. Missing current localization structures:");
  for (const label of missingStructures) console.error(" - " + label);
  process.exitCode = 1;
} else {
  const documentCount = data.split('id: "').length - 1;
  console.log("Localization structure audit passed: Kazakh UI, topic translations and document-card translation function found.");
  console.log("Document registry records inspected: " + documentCount);
}
