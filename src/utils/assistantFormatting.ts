export function escapeAssistantHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
  };
  return value.replace(/[&<>"]/g, (char) => entities[char] ?? char);
}

export function assistantTextToHtml(value: string): string {
  const safe = escapeAssistantHtml(value.replace(/\r/g, ""));
  return safe
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Remove any malformed/unpaired Markdown emphasis markers left by model output.
    .replace(/\*{1,3}/g, "")
    .replace(/\n/g, "<br />");
}
