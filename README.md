# Élite Publishing: memoir portfolio (demonstration samples)

Original demonstration samples created by Élite Publishing. All characters and events are fictional.

## Deliverables (`deliverables/`)
| File | Contents |
|---|---|
| `Elite_Publishing_Memoir_Sample.pdf` | *The Shape of Ordinary Days*, Chapter One (about 1,720 words), US Letter, 5 pp. |
| `Elite_Publishing_Nonfiction_Sample.pdf` | *When Life Changes Its Pace* (about 1,290 words), US Letter, 4 pp. |
| `Elite_Publishing_Memoir_Design_Sample.pdf` | Front cover, title page, credits, chapter opening and 3 text pages (6 × 9 in), plus design notes |

`COVER_MESSAGE.md` holds the message to send with the attachments.

## Editable files
- `editable/`: Word versions of both texts and the cover artwork as SVG
- `source/text/*.md`: master texts (edit these and rebuild)
- `source/*.css`, `source/design-sample.template.html`, `source/lib/art.js` (cover and ornament artwork)
- `previews/`: PNG renders of every page

## Rebuild
```
cd source && npm install && node build.js && node make-docx.js
```
This needs Playwright with Chromium and `pdftoppm` (poppler-utils).

## Fonts
EB Garamond and Cormorant Garamond, both under the SIL Open Font License 1.1 (licences are in `source/fonts/`). The fonts are embedded in the PDFs. The SVG and DOCX files expect the fonts to be installed locally.
