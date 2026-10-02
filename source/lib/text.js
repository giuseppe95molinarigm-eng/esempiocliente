// Text helpers: a tiny Markdown subset → HTML blocks, typographic quotes and soft hyphens.
const fs = require('fs');
const { hyphenateSync } = require('hyphen/en-us');

// Curly quotes, closed em dashes, ellipses.
function smarten(s) {
  return s
    .replace(/\s+—(?=")/g, '—')          // "already —"  → "already—"
    .replace(/\s+—\s+/g, '—')            // spaced em dash → closed (US style)
    .replace(/\s+—$/g, '—')
    .replace(/(^|[\s(\[—])"(?=\S)/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s(\[—])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/\.\.\./g, '…');
}

function inline(s) {
  return smarten(s)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Insert soft hyphens in long lower-case words only (never in names, short words or the
// last word of a paragraph), and tie a short final word to the one before it to avoid runts.
function hyphenate(html) {
  const lastWord = (html.replace(/<[^>]+>/g, '').match(/([A-Za-z\u2019]+)[^A-Za-z]*$/) || [])[1];
  let out = html.replace(/(<[^>]+>)|([A-Za-z\u2019]+)/g, (m, tag, word, off) => {
    if (tag) return tag;
    if (word.length < 7 || /^[A-Z]/.test(word) || word.includes('\u2019')) return word;
    if (word === lastWord && html.indexOf(word, off + 1) === -1) return word;
    return hyphenateSync(word, { minWordLength: 7 });
  });
  const i = out.lastIndexOf(' ');
  if (i > 0 && out.slice(i + 1).replace(/<[^>]+>/g, '').length <= 9) out = out.slice(0, i) + '\u00A0' + out.slice(i + 1);
  return out;
}

// Parse the restricted Markdown used in text/*.md into an array of blocks.
function parse(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const blocks = [];
  for (const chunk of raw.split(/\n\s*\n/)) {
    const t = chunk.trim();
    if (!t) continue;
    if (t.startsWith('## ')) blocks.push({ type: 'h2', text: t.slice(3) });
    else if (t.startsWith('# ')) blocks.push({ type: 'h1', text: t.slice(2) });
    else if (/^\\\*\s*\\\*\s*\\\*$/.test(t)) blocks.push({ type: 'break' });
    else if (/^\*[^*]+\*$/.test(t) && blocks.length && blocks[blocks.length - 1].type === 'h1')
      blocks.push({ type: 'dek', text: t.slice(1, -1) });
    else blocks.push({ type: 'p', text: t.replace(/\s*\n\s*/g, ' ') });
  }
  return blocks;
}

// Wrap the first few words of an opening paragraph in small capitals.
function leadIn(html, words = 4) {
  const parts = html.split(' ');
  let n = Math.min(words, parts.length);
  // stop the lead-in at the first comma if it comes sooner
  for (let i = 0; i < n; i++) if (/[,;:]$/.test(parts[i].replace(/<[^>]+>/g, ''))) { n = i + 1; break; }
  return `<span class="lead-in">${parts.slice(0, n).join(' ')}</span> ${parts.slice(n).join(' ')}`;
}

function wordCount(blocks) {
  return blocks.filter(b => b.type === 'p').map(b => b.text.replace(/[*—]/g, ' ').trim().split(/\s+/).length).reduce((a, b) => a + b, 0);
}

module.exports = { smarten, inline, hyphenate, parse, leadIn, wordCount };
