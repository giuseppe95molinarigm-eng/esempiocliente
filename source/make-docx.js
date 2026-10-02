// Editable Word versions of the two writing samples.
const fs = require('fs'), path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('/opt/node22/lib/node_modules/docx');
const T = require('./lib/text');
const DISC = 'Original demonstration sample created by Élite Publishing. All characters and events are fictional.';
function runs(text, size = 24) {
  return T.smarten(text).split(/(\*[^*]+\*)/).filter(Boolean).map(s =>
    new TextRun({ text: s.replace(/^\*|\*$/g, ''), italics: s.startsWith('*'), font: 'EB Garamond', size }));
}
function build(file, out, label) {
  const kids = [new Paragraph({ children: [new TextRun({ text: 'ÉLITE PUBLISHING  /  ' + label, font: 'EB Garamond', size: 17, color: '46657A' })], spacing: { after: 240 } })];
  let first = true;
  for (const b of T.parse(path.join(__dirname, 'text', file))) {
    if (b.type === 'h1') { kids.push(new Paragraph({ children: [new TextRun({ text: b.text, font: 'Cormorant Garamond', size: 56 })], spacing: { after: 120 } })); continue; }
    if (b.type === 'dek' || (b.type === 'h2' && file.startsWith('memoir'))) {
      kids.push(new Paragraph({ children: [new TextRun({ text: T.smarten(b.text).replace('One — ', 'Chapter One · '), italics: true, font: 'EB Garamond', size: 26, color: '5D5750' })], spacing: { after: 240 } }));
      kids.push(new Paragraph({ children: [new TextRun({ text: DISC, italics: true, font: 'EB Garamond', size: 19, color: '5D5750' })], spacing: { after: 480 } }));
      continue;
    }
    if (b.type === 'h2') { kids.push(new Paragraph({ children: [new TextRun({ text: b.text.toUpperCase(), font: 'EB Garamond', size: 19, color: '46657A', characterSpacing: 30 })], spacing: { before: 360, after: 120 }, keepNext: true })); first = true; continue; }
    if (b.type === 'break') { kids.push(new Paragraph({ children: [new TextRun({ text: '*   *   *', font: 'EB Garamond', size: 22, color: '46657A' })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } })); first = true; continue; }
    kids.push(new Paragraph({ children: runs(b.text), indent: first ? undefined : { firstLine: 400 }, spacing: { line: 360 }, alignment: AlignmentType.JUSTIFIED }));
    first = false;
  }
  kids.push(new Paragraph({ children: [new TextRun({ text: DISC, italics: true, font: 'EB Garamond', size: 19, color: '5D5750' })], spacing: { before: 480 } }));
  const doc = new Document({ creator: 'Élite Publishing', title: label, sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 2016, right: 2016 } } }, children: kids }] });
  return Packer.toBuffer(doc).then(buf => fs.writeFileSync(path.join(__dirname, '..', 'editable', out), buf));
}
fs.mkdirSync(path.join(__dirname, '..', 'editable'), { recursive: true });
Promise.all([
  build('memoir_chapter.md', 'Elite_Publishing_Memoir_Sample.docx', 'Memoir Writing Sample'),
  build('nonfiction_essay.md', 'Elite_Publishing_Nonfiction_Sample.docx', 'Nonfiction Writing Sample'),
]).then(() => console.log('docx ok'));
