import { AVATAR_COLORS } from './constants';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// Initialen aus einem Namen ("Kay Schmid" -> "KS").
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministische Avatar-Farbe aus einem String (Name).
export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Minimaler Markdown-Renderer (kein externes Paket nötig).
// Unterstützt: Überschriften, fett, kursiv, code, Links, Listen, Zeilenumbrüche.
export function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = escape(md).split('\n');
  const html: string[] = [];
  let inList = false;

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, '<code class="rounded bg-hover px-1 py-0.5 text-[12px]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a class="text-accent hover:underline" href="$2" target="_blank" rel="noopener">$1</a>',
      );

  for (const raw of lines) {
    const line = raw.trimEnd();
    const listMatch = line.match(/^[-*]\s+(.*)/);
    if (listMatch) {
      if (!inList) {
        html.push('<ul class="list-disc pl-5 my-1">');
        inList = true;
      }
      html.push(`<li>${inline(listMatch[1])}</li>`);
      continue;
    }
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    if (line.startsWith('### ')) html.push(`<h3 class="font-semibold mt-2">${inline(line.slice(4))}</h3>`);
    else if (line.startsWith('## ')) html.push(`<h2 class="font-semibold text-[15px] mt-2">${inline(line.slice(3))}</h2>`);
    else if (line.startsWith('# ')) html.push(`<h1 class="font-semibold text-[16px] mt-2">${inline(line.slice(2))}</h1>`);
    else if (line === '') html.push('<div class="h-2"></div>');
    else html.push(`<p>${inline(line)}</p>`);
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
