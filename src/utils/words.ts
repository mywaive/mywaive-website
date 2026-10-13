/**
 * Split text into words for per-word animation (BlurText, ScrollReveal), at build time.
 * Each word is a list of pieces so a highlight that ends mid-word ("everyone" + ".")
 * stays one word and keeps its styling.
 */
export type Piece = { text: string; highlight: boolean };

export function splitWords(text: string, highlight?: string): Piece[][] {
  const at = highlight ? text.indexOf(highlight) : -1;
  const segments: Piece[] = at < 0
    ? [{ text, highlight: false }]
    : [
        { text: text.slice(0, at), highlight: false },
        { text: highlight!, highlight: true },
        { text: text.slice(at + highlight!.length), highlight: false },
      ];

  const words: Piece[][] = [];
  let startNew = true;
  for (const seg of segments) {
    for (const token of seg.text.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) { startNew = true; continue; }
      if (startNew || words.length === 0) { words.push([]); startNew = false; }
      words[words.length - 1].push({ text: token, highlight: seg.highlight });
    }
  }
  return words;
}
