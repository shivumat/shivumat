// Draws the profile header: my name printed in two inks that slide into register, and a real
// bubble sort running beside it. Writes assets/header-light.svg and assets/header-dark.svg.
//
//   node scripts/header.mjs
//
// GitHub shows a README image as <img>, which can't run JavaScript or load fonts. CSS
// animations inside the SVG still play, so the motion is CSS keyframes computed from the
// sort's trace, and the fonts (all SIL OFL, licences in assets/fonts) are embedded.
// Under prefers-reduced-motion the bars rest sorted and the inks rest in register.
import { readFileSync, writeFileSync } from "node:fs"

const font = (file) => readFileSync(new URL(`../assets/fonts/${file}`, import.meta.url)).toString("base64")
const faces = `
@font-face{font-family:"Anybody";src:url(data:font/woff2;base64,${font("anybody-latin.woff2")}) format("woff2");font-weight:100 900;font-stretch:50% 150%}
@font-face{font-family:"Plex Mono";src:url(data:font/woff2;base64,${font("plex-mono-latin-400.woff2")}) format("woff2")}
@font-face{font-family:"Plex Sans";src:url(data:font/woff2;base64,${font("plex-sans-latin-400.woff2")}) format("woff2")}`

// Riso palette from @shivumat/tokens (moods/riso), light and dark.
const THEMES = {
  light: {
    bg: "oklch(0.955 0.02 85)", fg: "oklch(0.22 0.05 262)", muted: "oklch(0.42 0.05 262)",
    accent: "oklch(0.48 0.2 258)", ink2: "oklch(0.72 0.19 45)", line: "oklch(0.85 0.03 85)",
    compare: "oklch(0.55 0.13 75)", change: "oklch(0.55 0.19 40)", done: "oklch(0.5 0.13 155)",
    grain: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0",
  },
  dark: {
    bg: "oklch(0.2 0.03 262)", fg: "oklch(0.95 0.015 85)", muted: "oklch(0.8 0.02 85)",
    accent: "oklch(0.78 0.13 250)", ink2: "oklch(0.62 0.19 45)", line: "oklch(0.34 0.04 262)",
    compare: "oklch(0.84 0.14 85)", change: "oklch(0.78 0.15 50)", done: "oklch(0.8 0.15 155)",
    grain: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0",
  },
}

// ---------------------------------------------------------------- the sort, as a trace
const VALUES = [6, 2, 8, 4, 9, 1, 7, 3]
function trace(values) {
  const a = values.slice()
  const ids = a.map((_, i) => i)
  const steps = []
  const done = new Set()
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false
    for (let i = 0; i < end; i++) {
      steps.push({ ids: ids.slice(), cmp: [ids[i], ids[i + 1]], swap: false, done: new Set(done) })
      if (a[i] > a[i + 1]) {
        ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
        ;[ids[i], ids[i + 1]] = [ids[i + 1], ids[i]]
        swapped = true
        steps.push({ ids: ids.slice(), cmp: [ids[i], ids[i + 1]], swap: true, done: new Set(done) })
      }
    }
    done.add(ids[end])
    if (!swapped) {
      ids.forEach((id) => done.add(id))
      break
    }
  }
  ids.forEach((id) => done.add(id))
  steps.push({ ids: ids.slice(), cmp: [], swap: false, done: new Set(done) })
  return steps
}
const STEPS = trace(VALUES)

// ---------------------------------------------------------------- geometry and timing
const W = 880
const H = 270
const BAR_W = 26
const GAP = 7
const SLOT = BAR_W + GAP
const BARS_X = W - 40 - VALUES.length * SLOT + GAP
const BASE_Y = 214
const MAX_H = 118
const STEP_S = 0.42
const HOLD_S = 2.4
const TOTAL = STEPS.length * STEP_S + HOLD_S
const pct = (t) => `${((t / TOTAL) * 100).toFixed(3)}%`

/** Keyframes for one bar: its slot over time, and its state colour per step. */
function barKeyframes(id) {
  const move = []
  const fill = []
  STEPS.forEach((s, k) => {
    const t0 = k * STEP_S
    const x = s.ids.indexOf(id) * SLOT
    const prev = (STEPS[k - 1] ?? s).ids.indexOf(id) * SLOT
    // Hold the previous slot until this step starts, arrive in its first 60%, then hold.
    if (k > 0) move.push(`${pct(t0)}{transform:translateX(${prev}px)}`)
    move.push(`${pct(t0 + STEP_S * 0.6)}{transform:translateX(${x}px)}`)
    const state = s.done.has(id) ? "done" : s.cmp.includes(id) ? (s.swap ? "change" : "compare") : "rest"
    fill.push(`${pct(t0)}{fill:var(--${state})}`, `${pct(t0 + STEP_S - 0.001)}{fill:var(--${state})}`)
  })
  const first = STEPS[0].ids.indexOf(id) * SLOT
  move.unshift(`0%{transform:translateX(${first}px)}`)
  move.push(`100%{transform:translateX(${STEPS.at(-1).ids.indexOf(id) * SLOT}px)}`)
  // Loop: snap back to the starting order at the very end of the hold.
  move.splice(move.length - 1, 0, `${pct(TOTAL - 0.05)}{transform:translateX(${STEPS.at(-1).ids.indexOf(id) * SLOT}px)}`)
  move[move.length - 1] = `100%{transform:translateX(${first}px)}`
  fill.push(`100%{fill:var(--rest)}`)
  return `@keyframes m${id}{${move.join("")}}@keyframes f${id}{${fill.join("")}}`
}

function svg(theme) {
  const t = THEMES[theme]
  const sorted = STEPS.at(-1).ids
  const bars = VALUES.map((v, id) => {
    const h = 22 + (MAX_H * v) / Math.max(...VALUES)
    const rest = sorted.indexOf(id) * SLOT
    return `<g class="bar b${id}" style="transform:translateX(${rest}px)">
      <rect class="ink" x="3" y="${BASE_Y - h - 3}" width="${BAR_W}" height="${h}"/>
      <rect class="body f${id}" x="0" y="${BASE_Y - h}" width="${BAR_W}" height="${h}"/>
      <text class="val" x="${BAR_W / 2}" y="${BASE_Y - h + 16}">${v}</text>
    </g>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">Shivank Mathur</title>
<desc id="desc">My name printed in two inks that slide into register, beside a bubble sort of eight bars running step by step.</desc>
<style>${faces}
svg{--rest:${t.accent};--compare:${t.compare};--change:${t.change};--done:${t.done}}
.name{font:720 66px "Anybody",sans-serif;font-stretch:96%;letter-spacing:-.01em}
.name.main{fill:${t.accent}}
.name.ink{fill:${t.ink2};animation:register 1.4s cubic-bezier(.7,0,.2,1) .2s both}
.line{font:400 19px "Plex Sans",sans-serif;fill:${t.muted}}
.mono{font:400 13px "Plex Mono",monospace;fill:${t.muted}}
.bar rect.body{fill:var(--rest)}
.bar rect.ink{fill:${t.ink2};opacity:.9}
.val{font:500 12px "Plex Mono",monospace;fill:${t.bg};text-anchor:middle}
.base{stroke:${t.line};stroke-width:1}
@keyframes register{from{transform:translate(16px,-12px)}to{transform:translate(4px,3px)}}
${VALUES.map((_, id) => barKeyframes(id)).join("\n")}
${VALUES.map((_, id) => `.b${id}{animation:m${id} ${TOTAL}s linear infinite}.f${id}{animation:f${id} ${TOTAL}s step-end infinite}`).join("\n")}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.name.ink{transform:translate(4px,3px)}.bar rect.body{fill:var(--done)}}
</style>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="${t.grain}"/></filter>
<rect width="${W}" height="${H}" rx="14" fill="${t.bg}"/>
<rect width="${W}" height="${H}" rx="14" filter="url(#grain)"/>
<text class="name ink" x="40" y="118">Shivank Mathur</text>
<text class="name main" x="40" y="118">Shivank Mathur</text>
<text class="line" x="42" y="164">Fast interfaces for data-heavy products,</text>
<text class="line" x="42" y="191">and the LLM plumbing underneath them.</text>
<text class="mono" x="42" y="238">shivumat.me</text>
<line class="base" x1="${BARS_X - 6}" x2="${W - 34}" y1="${BASE_Y + 0.5}" y2="${BASE_Y + 0.5}"/>
<g transform="translate(${BARS_X},0)">${bars}</g>
<text class="mono" x="${W - 40}" y="238" text-anchor="end">bubble sort · ${STEPS.length - 1} steps</text>
</svg>
`
}

for (const theme of Object.keys(THEMES)) {
  const out = new URL(`../assets/header-${theme}.svg`, import.meta.url)
  const s = svg(theme)
  writeFileSync(out, s)
  console.log(`assets/header-${theme}.svg  ${(s.length / 1024).toFixed(0)} KB, ${STEPS.length} steps, ${TOTAL.toFixed(1)} s loop`)
}
