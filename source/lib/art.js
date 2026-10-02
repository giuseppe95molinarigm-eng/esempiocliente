// Original vector artwork for "The Shape of Ordinary Days": two mugs on a low shelf in window light.
// Everything is drawn from simple shapes; no stock imagery is used.

const C = {
  oat: '#e9e0d1', oatDeep: '#d8ccb7', light: '#f7efde', ink: '#2a2723',
  shelf: '#3d352d', blue: '#46657a', cream: '#fbf8f2', shadow: '#ebdfc8',
};

// A mug standing with its base on y = base. Handle always on the right.
function mug({ x, base, w = 78, h = 86, fill, stroke = 'none', sw = 0, chip = false, id }) {
  const top = base - h;
  const r = Math.round(w * 0.1);
  const body = `M${x},${top} H${x + w} V${base - r} Q${x + w},${base} ${x + w - r},${base} H${x + r} Q${x},${base} ${x},${base - r} Z`;
  const hx = x + w - 6, hy = top + h * 0.2, hw = w * 0.4, hh = h * 0.47;
  const handleStroke = stroke === 'none' ? fill : stroke;
  const handleW = stroke === 'none' ? w * 0.095 : sw;
  const handle = `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="${hh * 0.42}" fill="none" stroke="${handleStroke}" stroke-width="${handleW}"/>`;
  let mask = '', maskAttr = '';
  if (chip) {
    const cx = x + w * 0.24;
    mask = `<mask id="${id}-chip"><rect x="${x - 20}" y="${top - 20}" width="${w * 2}" height="${h + 40}" fill="#fff"/>` +
      `<path d="M${cx - w * 0.05},${top - 1} L${cx + w * 0.05},${top - 1} L${cx + w * 0.015},${top + h * 0.055} L${cx - w * 0.02},${top + h * 0.03} Z" fill="#000"/></mask>`;
    maskAttr = ` mask="url(#${id}-chip)"`;
  }
  return `${mask}<g${maskAttr}>${handle}<path d="${body}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`;
}

// Full front cover, 6 × 9 in, drawn on a 600 × 900 grid.
function cover(id = 'cv') {
  return `<svg class="cover-art" viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cover: The Shape of Ordinary Days by Alex Morgan">
  <rect width="600" height="900" fill="${C.oat}"/>
  <!-- window light falling on the wall -->
  <path d="M300,412 L556,340 L556,640 L300,640 Z" fill="${C.light}"/>
  <path d="M424,376 L434,373 L434,640 L424,640 Z" fill="${C.oat}" opacity="0.85"/>
  <path d="M300,522 L556,463 L556,473 L300,532 Z" fill="${C.oat}" opacity="0.85"/>
  <clipPath id="${id}-lightclip"><path d="M300,412 L556,340 L556,640 L300,640 Z"/></clipPath>
  <g clip-path="url(#${id}-lightclip)">
    ${mug({ x: 346, base: 640, fill: C.shadow })}
    ${mug({ x: 466, base: 640, fill: C.shadow })}
  </g>
  <!-- the lower shelf and the cabinet below -->
  <rect x="0" y="652" width="600" height="248" fill="${C.oatDeep}"/>
  <rect x="0" y="640" width="600" height="13" fill="${C.shelf}"/>
  ${mug({ x: 326, base: 640, fill: C.blue, chip: true, id })}
  ${mug({ x: 446, base: 640, fill: C.cream, stroke: C.ink, sw: 2.6 })}
  <!-- type -->
  <g font-family="Cormorant Garamond, EB Garamond, serif" fill="${C.ink}">
    <text x="58" y="178" font-size="92" font-weight="500" letter-spacing="-0.5">The Shape</text>
    <text x="58" y="270" font-size="92" font-weight="500" letter-spacing="-0.5"><tspan font-style="italic" font-weight="400">of</tspan> Ordinary</text>
    <text x="58" y="362" font-size="92" font-weight="500" letter-spacing="-0.5">Days</text>
  </g>
  <rect x="61" y="404" width="44" height="2.4" fill="${C.blue}"/>
  <g font-family="EB Garamond, serif" font-style="italic" font-size="22" fill="${C.ink}">
    <text x="60" y="446">A Fictional Memoir</text>
    <text x="60" y="474">of Recovery and Return</text>
  </g>
  <text x="60" y="792" font-family="EB Garamond, serif" font-weight="500" font-size="25" letter-spacing="7" fill="${C.ink}">ALEX MORGAN</text>
</svg>`;
}

// Small shelf-and-mugs ornament used on the title page and chapter openings.
function ornament(id = 'orn', width = 96) {
  return `<svg class="ornament" viewBox="0 0 260 100" width="${width}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${mug({ x: 30, base: 88, fill: C.blue, chip: true, id })}
  ${mug({ x: 142, base: 88, fill: C.cream, stroke: C.ink, sw: 3.2 })}
  <rect x="0" y="88" width="260" height="7" fill="${C.shelf}"/>
</svg>`;
}

module.exports = { cover, ornament, C };
