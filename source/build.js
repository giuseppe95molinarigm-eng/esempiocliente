// Builds the three Élite Publishing demonstration PDFs from text/*.md.
// Usage: node build.js   (outputs to ../deliverables and ../previews)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const T = require('./lib/text');
const art = require('./lib/art');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'deliverables');
const PREV = path.join(ROOT, 'previews');
const HTML = path.join(__dirname, 'html');
for (const d of [OUT, PREV, HTML]) fs.mkdirSync(d, { recursive: true });

const DISCLAIMER = 'Original demonstration sample created by Élite Publishing. All characters and events are fictional.';

// ---------------------------------------------------------------- writing samples (US Letter)

function writingSample({ file, eyebrow, title, sub, about, runningTitle, endNote }) {
  const blocks = T.parse(path.join(__dirname, 'text', file));
  const words = T.wordCount(blocks);
  let body = '';
  let opening = true;
  let dek = '';
  for (const b of blocks) {
    if (b.type === 'h1') continue;
    if (b.type === 'dek') { dek = T.inline(b.text); continue; }
    if (b.type === 'h2' && file.startsWith('memoir')) continue; // chapter title is in the header block
    if (b.type === 'h2') { body += `<h2>${T.inline(b.text)}</h2>\n`; opening = true; continue; }
    if (b.type === 'break') { body += `<div class="break" aria-hidden="true"><span></span></div>\n`; opening = true; continue; }
    let html = T.inline(b.text);
    if (opening && !body) html = T.leadIn(html, 3);
    else if (opening && file.startsWith('memoir')) html = T.leadIn(html, 3);
    body += `<p${opening ? ' class="first"' : ''}>${T.hyphenate(html)}</p>\n`;
    opening = false;
  }
  const doc = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${title} — ${eyebrow}</title>
<link rel="stylesheet" href="../shared.css">
<link rel="stylesheet" href="../writing-sample.css">
<style>@page { @bottom-left { content: "${runningTitle}"; } }</style>
</head><body>
<header class="sample-head">
  <div class="eyebrow">Élite Publishing <span class="sep">/</span> ${eyebrow}</div>
  <h1>${title}</h1>
  <div class="sub">${sub || dek}</div>
  <aside class="about">
    <p>${about}</p>
    <p class="disclaimer">${DISCLAIMER}</p>
  </aside>
</header>
<main class="text">
${body}</main>
<footer class="end">
  <div class="endmark" aria-hidden="true"></div>
  <p>${endNote.replace('{words}', words.toLocaleString('en-US'))}</p>
  <p class="disclaimer">${DISCLAIMER}</p>
</footer>
</body></html>`;
  return { doc, words };
}

// ---------------------------------------------------------------- design sample (6 × 9 in)

function designSample() {
  const blocks = T.parse(path.join(__dirname, 'text', 'memoir_chapter.md'));
  const items = [];
  let opening = true;
  for (const b of blocks) {
    if (b.type === 'h1' || b.type === 'h2') continue;
    if (b.type === 'break') { items.push({ t: 'break' }); opening = true; continue; }
    let html = T.inline(b.text);
    if (opening) html = T.leadIn(html, 3);
    items.push({ t: 'p', cls: opening ? 'first' : '', html: T.hyphenate(html) });
    opening = false;
  }
  const tpl = fs.readFileSync(path.join(__dirname, 'design-sample.template.html'), 'utf8');
  return tpl
    .replace('{{COVER}}', art.cover('cover'))
    .replace('{{THUMB_L}}', art.cover('th1'))
    .replace('{{THUMB_S}}', art.cover('th2'))
    .replace('{{ORN_TITLE}}', art.ornament('ot', 92))
    .replace('{{ORN_CHAPTER}}', art.ornament('oc', 66))
    .replace(/\{\{DISCLAIMER\}\}/g, DISCLAIMER)
    .replace('{{ITEMS}}', JSON.stringify(items));
}

// ---------------------------------------------------------------- render

async function render(browser, htmlFile, pdfName) {
  const page = await browser.newPage();
  await page.goto('file://' + htmlFile);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !window.__paginating, null, { timeout: 30000 }).catch(() => {});
  const report = await page.evaluate(() => window.__report || null);
  const pdf = path.join(OUT, pdfName);
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  await page.close();
  const stem = pdfName.replace(/\.pdf$/, '');
  for (const f of fs.readdirSync(PREV)) if (f.startsWith(stem)) fs.unlinkSync(path.join(PREV, f));
  execFileSync('pdftoppm', ['-r', '110', '-png', pdf, path.join(PREV, stem)]);
  return report;
}

(async () => {
  const memoir = writingSample({
    file: 'memoir_chapter.md',
    eyebrow: 'Memoir Writing Sample',
    title: 'The Shape of Ordinary Days',
    sub: 'Chapter One <span class="sep">·</span> <em>The Lower Shelf</em>',
    runningTitle: 'The Shape of Ordinary Days  ·  Memoir Writing Sample',
    about: 'An excerpt from an imagined memoir, written to show how we work with voice, scene and dialogue when a book is drawn from lived experience. The narrator returns home after a long stay in the hospital; the chapter follows their first day and the morning after.',
    endNote: 'End of excerpt. Chapter One of an imagined memoir, approximately {words} words.',
  });
  const essay = writingSample({
    file: 'nonfiction_essay.md',
    eyebrow: 'Nonfiction Writing Sample',
    title: 'When Life Changes Its Pace',
    runningTitle: 'When Life Changes Its Pace  ·  Nonfiction Writing Sample',
    about: 'A short reflective essay, written to show how we develop a single idea across a structured piece of nonfiction. The examples are illustrative and invented; the essay offers reflection, not medical or professional advice.',
    endNote: 'End of sample. A reflective essay of approximately {words} words.',
  });
  fs.writeFileSync(path.join(HTML, 'memoir_sample.html'), memoir.doc);
  fs.writeFileSync(path.join(HTML, 'nonfiction_sample.html'), essay.doc);
  fs.writeFileSync(path.join(HTML, 'design_sample.html'), designSample());
  fs.writeFileSync(path.join(__dirname, 'cover.svg'), art.cover('cover').replace('<svg ', '<svg width="600" height="900" '));

  const browser = await chromium.launch();
  console.log('memoir words', memoir.words, 'essay words', essay.words);
  await render(browser, path.join(HTML, 'memoir_sample.html'), 'Elite_Publishing_Memoir_Sample.pdf');
  await render(browser, path.join(HTML, 'nonfiction_sample.html'), 'Elite_Publishing_Nonfiction_Sample.pdf');
  const rep = await render(browser, path.join(HTML, 'design_sample.html'), 'Elite_Publishing_Memoir_Design_Sample.pdf');
  console.log('design paginator:', JSON.stringify(rep, null, 1));
  await browser.close();
})();
