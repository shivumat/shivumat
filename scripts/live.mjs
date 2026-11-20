// Refreshes the "Lately" block in README.md (between the live markers) from public sources:
// the newest write-up in shivumat.me's RSS feed and last week's npm downloads of the design
// system. No secrets: both are public endpoints. Run daily by .github/workflows/live.yml.
//
//   node scripts/live.mjs
import { readFileSync, writeFileSync } from "node:fs"

const README = new URL("../README.md", import.meta.url)
const FEED = "https://www.shivumat.me/writing/feed.xml"
const NPM = "https://api.npmjs.org/downloads/point/last-week/@shivumat/tokens"

const text = (xml, tag) => xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1]?.trim()
const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&")

async function latestPost() {
  try {
    const res = await fetch(FEED)
    if (!res.ok) return null
    const item = text(await res.text(), "item")
    if (!item) return null
    return { title: unescape(text(item, "title") ?? ""), link: text(item, "link"), date: text(item, "pubDate") }
  } catch {
    return null
  }
}

async function downloads() {
  try {
    const res = await fetch(NPM)
    const data = await res.json().catch(() => ({}))
    // npm answers "package … not found" until it has recorded any downloads: that means zero.
    if (res.status === 404 && /not found/i.test(String(data.error))) return 0
    if (!res.ok) return null
    return typeof data.downloads === "number" ? data.downloads : null
  } catch {
    return null
  }
}

const [post, dl] = await Promise.all([latestPost(), downloads()])
const day = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

const lines = [
  post?.link
    ? `- Latest write-up: [${post.title}](${post.link}), ${day(post.date)}`
    : "- Latest write-up: the first one lands in December",
  dl === null
    ? "- `@shivumat/tokens` downloads last week: npm didn't answer today"
    : `- \`@shivumat/tokens\` downloads last week: ${dl === 0 ? "none yet" : dl.toLocaleString("en-GB")}`,
  `- Checked ${day(Date.now())} by a GitHub Action`,
]

const readme = readFileSync(README, "utf8")
const block = `<!-- live:start -->\n${lines.join("\n")}\n<!-- live:end -->`
const next = readme.replace(/<!-- live:start -->[\s\S]*?<!-- live:end -->/, block)
if (next === readme) {
  console.log("no change")
} else {
  writeFileSync(README, next)
  console.log(lines.join("\n"))
}
