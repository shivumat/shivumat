// Draws the profile header: my name printed in two inks that slide into register, beside
// "my actual stack", a tech-stack diagram whose layers are personal. The layers build from
// the bottom up; the top one ("ships it, eventually") arrives after a pointed pause.
// Writes assets/header-light.svg and assets/header-dark.svg.
//
//   node scripts/header.mjs
//
// GitHub shows a README image as <img>, which can't run JavaScript or load fonts. CSS
// animations inside the SVG still play, so the motion is CSS, and the fonts (all SIL OFL,
// licences in assets/fonts) are embedded. Under prefers-reduced-motion everything rests in
// its final place.
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
    accent: "oklch(0.48 0.2 258)", onAccent: "oklch(0.975 0.015 85)", ink2: "oklch(0.72 0.19 45)",
    onInk2: "oklch(0.22 0.05 262)", grain: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0",
  },
  dark: {
    bg: "oklch(0.2 0.03 262)", fg: "oklch(0.95 0.015 85)", muted: "oklch(0.8 0.02 85)",
    accent: "oklch(0.78 0.13 250)", onAccent: "oklch(0.2 0.03 262)", ink2: "oklch(0.62 0.19 45)",
    onInk2: "oklch(0.95 0.015 85)", grain: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0",
  },
}

// Top of the stack first, the way stack diagrams read.
const LAYERS = [
  "ships it, eventually",
  "TypeScript, mostly",
  "a game I'll finish someday",
  "a chess engine in another tab",
  "one more side project",
  "curiosity (load-bearing)",
]

const W = 880
const H = 300
const STACK_X = 492
const STACK_W = 348
const LAYER_H = 31
const LAYER_GAP = 6
const STACK_TOP = 34
const DROP = 0.32 // seconds between layers
const PAUSE = 1.1 // extra wait before the top layer: "eventually"

function svg(theme) {
  const t = THEMES[theme]
  const n = LAYERS.length
  const layers = LAYERS.map((label, i) => {
    const y = STACK_TOP + i * (LAYER_H + LAYER_GAP)
    const fromBottom = n - 1 - i
    const delay = 0.5 + fromBottom * DROP + (i === 0 ? PAUSE : 0)
    const foundation = i === n - 1
    return `<g class="layer${foundation ? " foundation" : ""}" style="animation-delay:${delay.toFixed(2)}s">
      <rect class="shadow" x="${STACK_X + 4}" y="${y - 4}" width="${STACK_W}" height="${LAYER_H}"/>
      <rect class="block" x="${STACK_X}" y="${y}" width="${STACK_W}" height="${LAYER_H}"/>
      <text class="label" x="${STACK_X + 14}" y="${y + 20.5}">${label.replace(/'/g, "&#8217;")}</text>
    </g>`
  }).join("")
  const stackBottom = STACK_TOP + n * (LAYER_H + LAYER_GAP) - LAYER_GAP
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">Shivank Mathur</title>
<desc id="desc">My name printed in two inks, beside "my actual stack": from the bottom up, curiosity (load-bearing), one more side project, a chess engine in another tab, a game I'll finish someday, TypeScript mostly, and on top, ships it, eventually.</desc>
<style>${faces}
.name{font:720 64px "Anybody",sans-serif;font-stretch:96%;letter-spacing:-.01em}
.name.main{fill:${t.accent}}
.name.ink{fill:${t.ink2};animation:register 1.4s cubic-bezier(.7,0,.2,1) .2s both}
.line{font:400 19px "Plex Sans",sans-serif;fill:${t.muted}}
.mono{font:400 13px "Plex Mono",monospace;fill:${t.muted}}
.block{fill:${t.accent}}
.shadow{fill:${t.ink2};opacity:.9}
.label{font:500 15px "Plex Mono",monospace;fill:${t.onAccent}}
.foundation .block{fill:${t.ink2}}
.foundation .shadow{fill:${t.accent}}
.foundation .label{fill:${t.onInk2}}
.layer{animation:drop .55s cubic-bezier(.34,1.4,.64,1) both}
@keyframes register{from{transform:translate(16px,-12px)}to{transform:translate(4px,3px)}}
@keyframes drop{from{transform:translateY(-46px);opacity:0}60%{opacity:1}to{transform:none;opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.name.ink{transform:translate(4px,3px)}}
</style>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="${t.grain}"/></filter>
<rect width="${W}" height="${H}" rx="14" fill="${t.bg}"/>
<rect width="${W}" height="${H}" rx="14" filter="url(#grain)"/>
<text class="name ink" x="40" y="126">Shivank</text>
<text class="name main" x="40" y="126">Shivank</text>
<text class="name ink" x="40" y="190">Mathur</text>
<text class="name main" x="40" y="190">Mathur</text>
<text class="line" x="42" y="232">Senior engineer. Overthinks the edge cases</text>
<text class="line" x="42" y="258">so you don&#8217;t have to.</text>
${layers}
<text class="mono" x="${STACK_X + STACK_W}" y="${stackBottom + 30}" text-anchor="end">my actual stack</text>
</svg>
`
}

for (const theme of Object.keys(THEMES)) {
  const s = svg(theme)
  writeFileSync(new URL(`../assets/header-${theme}.svg`, import.meta.url), s)
  console.log(`assets/header-${theme}.svg  ${(s.length / 1024).toFixed(0)} KB`)
}
