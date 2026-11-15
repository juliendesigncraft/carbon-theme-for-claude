// Genera hooks/scena.ts: il paesaggio a pixel di Spazio (stesso rumore e retino della sua hero) in fondo,
// nei grigi di Carbone, e la navicella 11x16 di Spazio e Pulsar che fluttua.
// Uso: node strumenti/genera-scena.mjs [anteprima.ppm]
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const qui = dirname(fileURLToPath(import.meta.url))
const VB_W = 1600, VB_H = 1000
const W = 320, H = 44, P = 5                     // striscia: 320x34 pixel da 5 unità, alta 170 su 1000
const Y0 = VB_H - H * P

// rumore di Spazio
const perm = new Uint8Array(512); { const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = (i * 2654435761 % (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]] } for (let i = 0; i < 512; i++) perm[i] = p[i & 255] }
const h2 = (i, j) => perm[(perm[i & 255] + j) & 255] / 255
const sm = t => t * t * (3 - 2 * t)
const vn = (px, py) => { const i = Math.floor(px), j = Math.floor(py), fx = sm(px - i), fy = sm(py - j); const a = h2(i, j), b = h2(i + 1, j), c = h2(i, j + 1), e = h2(i + 1, j + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + e) * fx * fy }
const fbm = (px, py) => { let v = 0, a = .5, f = 1; for (let o = 0; o < 4; o++) { v += a * vn(px * f, py * f); a *= .5; f *= 2.03 } return v }
const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
// ripetibile in orizzontale: si mescola col pezzo a una larghezza di distanza
const tile = (f, k, y) => ((W - k) * f(k, y) + k * f(k - W, y)) / W

const pick = h => h < .30 ? 0 : h < .37 ? 1 : h < .40 ? 2 : h < .58 ? 3 : h < .63 ? 4 : h < .79 ? 5 : 6
const livelli = []                                // livello per pixel: 0..6, 7 = stella, 8 = grana
for (let y = 0; y < H; y++) for (let k = 0; k < W; k++) {
  const g = y / H
  const n = tile((a, b) => fbm(a / 72, b / 62), k, y)
  const h = n * .7 + g * .95 - .34 + (B[(y & 3) * 4 + (k & 3)] - 7.5) / 16 * .05
  let l = pick(h)
  const sp = tile((a, b) => fbm(a / 4.5 + 40, b / 4.5), k, y)
  if (h < .5 && h > .3 && sp > .8) l = 7
  else if (h > .6 && sp > .76) l = 8
  livelli.push(l)
}
// una path per livello, a righe: "M x y h w v1 h-w z"
const paths = Array.from({ length: 9 }, () => '')
for (let y = 0; y < H; y++) {
  let k = 0
  while (k < W) {
    const l = livelli[y * W + k]; let e = k + 1
    while (e < W && livelli[y * W + e] === l) e++
    if (l !== 0) paths[l] += `M${k * P} ${y * P}h${(e - k) * P}v${P}h-${(e - k) * P}z`
    k = e
  }
}
const striscia = paths.map((d, l) => d ? `<path class="l${l}" d="${d}"/>` : '').join('')

// la navicella di Spazio e Pulsar
const NAVE = ['.....k.....', '....kwk....', '....kwk....', '...kwwwk...', '...kwbwk...', '..kwwbbwk..',
  '..kwwbbwk..', '..kwwwwsk..', '..kwwwwsk..', '.kowwwwsok.', 'kooswwwsook', 'kokssssskok',
  'k.kssssk..k', '...koook...', '....k.k....']
const R = 7                                        // pixel della navicella
const navePaths = {}
NAVE.forEach((riga, r) => [...riga].forEach((c, x) => { if (c !== '.') navePaths[c] = (navePaths[c] ?? '') + `M${x * R} ${r * R}h${R}v${R}h-${R}z` }))
const nave = Object.entries(navePaths).map(([c, d]) => `<path class="n${c}" d="${d}"/>`).join('')
// fiamma: tre colonne, più corta ai lati, tre toni
const fiamma = [0, 1, 2, 3, 4].flatMap(i => [-1, 0, 1].filter(w => !(Math.abs(w) === 1 && i > 2)).map(w =>
  `<rect class="f${i < 2 ? 0 : i < 4 ? 1 : 2}" x="${(5 + w) * R}" y="${(15 + i) * R}" width="${R}" height="${R}"/>`)).join('')

const NX = 1150, NY = Y0 - 16 * R - 70

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges">
<style>
.fondo{fill:#121013}
.l1{fill:#151217}.l2{fill:#19161B}.l3{fill:#1D1A1F}.l4{fill:#28242B}.l5{fill:#3A3540}.l6{fill:#58525F}.l7{fill:#8A8590}.l8{fill:#2A262C}
.nk{fill:#0F0D10}.nw{fill:#B9B5BE}.ns{fill:#6E6874}.no{fill:#8B8391}.nb{fill:#E9E6EC}
.f0{fill:#E6E6E6}.f1{fill:#B5B5B5}.f2{fill:#8A8A8A}
.st{fill:#EEEBF0}
@media (prefers-color-scheme:light){
.fondo{fill:#EEF0F3}
.l1{fill:#EBEDF0}.l2{fill:#E7E9ED}.l3{fill:#E2E5E9}.l4{fill:#DBDEE3}.l5{fill:#CED2D8}.l6{fill:#BEC2CA}.l7{fill:#A9ADB6}.l8{fill:#D6D9DE}
.nk{fill:#1C1F28}.nw{fill:#F6F7F9}.ns{fill:#C3C7CF}.no{fill:#9EA2AB}.nb{fill:#1C1F28}
.f0{fill:#1C1F28}.f1{fill:#5F626A}.f2{fill:#A9ADB6}.st{fill:#1C1F28}}
.terra{animation:scorre 240s linear infinite}
@keyframes scorre{from{transform:translateX(0)}to{transform:translateX(-${W * P}px)}}
.nave{animation:fluttua 3.9s steps(1) infinite}
@keyframes fluttua{0%{transform:translateY(0)}25%{transform:translateY(-${R}px)}50%{transform:translateY(0)}75%{transform:translateY(${R}px)}}
.fiamma{animation:fiamma .5s steps(1) infinite}
@keyframes fiamma{0%{transform:scaleY(1)}33%{transform:scaleY(.8)}66%{transform:scaleY(.6)}}
.fiamma{transform-box:fill-box;transform-origin:top}
.st{animation:luce 7s ease-in-out infinite}.st:nth-child(2n){animation-delay:2.5s}.st:nth-child(3n){animation-delay:4.5s}
@keyframes luce{0%,100%{opacity:.12}50%{opacity:.4}}
@media (prefers-reduced-motion:reduce){.terra,.nave,.fiamma,.st{animation:none}}
</style>
<rect class="fondo" width="${VB_W}" height="${VB_H}"/>
<g>${[[120, 90], [340, 210], [560, 60], [820, 160], [1040, 80], [1480, 140], [210, 420], [700, 380], [1500, 420], [60, 300], [1240, 300], [960, 520]].map(([x, y]) => `<rect class="st" x="${x}" y="${y}" width="3" height="3"/>`).join('')}</g>
<g transform="translate(0 ${Y0})"><g class="terra">${striscia}<g transform="translate(${W * P} 0)">${striscia}</g></g></g>
<g transform="translate(${NX} ${NY})"><g class="nave">${nave}<g class="fiamma">${fiamma}</g></g></g>
</svg>`

writeFileSync(join(qui, '..', 'hooks', 'scena.ts'),
  `// Generato da strumenti/genera-scena.mjs: non modificare a mano.\n// Il paesaggio a pixel di Spazio in fondo e la navicella di Spazio e Pulsar, nei grigi di Carbone.\nexport const RAZZO = ${JSON.stringify(svg)}\n`)
console.log('caratteri SVG:', svg.length)

// anteprima PPM (solo scuro, senza animazione)
const out = process.argv[2]
if (out) {
  const hex = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16))
  const C = ['#121013', '#151217', '#19161B', '#1D1A1F', '#28242B', '#3A3540', '#58525F', '#8A8590', '#2A262C'].map(hex)
  const NC = { k: '#0F0D10', w: '#B9B5BE', s: '#6E6874', o: '#8B8391', b: '#E9E6EC' }
  const S = 2, PW = VB_W / S, PH = VB_H / S, img = Buffer.alloc(PW * PH * 3)
  const put = (x, y, c) => { if (x < 0 || y < 0 || x >= PW || y >= PH) return; const o = (y * PW + x) * 3; img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2] }
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) put(x, y, C[0])
  for (let y = 0; y < H; y++) for (let k = 0; k < W; k++) for (let a = 0; a < P / S + 1; a++) for (let b = 0; b < P / S + 1; b++) put(Math.floor(k * P / S) + a, Math.floor((Y0 + y * P) / S) + b, C[livelli[y * W + k]])
  NAVE.forEach((riga, r) => [...riga].forEach((c, x) => { if (c === '.') return; for (let a = 0; a < Math.ceil(R / S); a++) for (let b = 0; b < Math.ceil(R / S); b++) put(Math.floor((NX + x * R) / S) + a, Math.floor((NY + r * R) / S) + b, hex(NC[c])) }))
  writeFileSync(out, Buffer.concat([Buffer.from(`P6 ${PW} ${PH} 255\n`), img]))
}
