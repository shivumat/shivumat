<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <img alt="Shivank Mathur. Fast interfaces for data-heavy products, and the LLM plumbing underneath them. A bubble sort of eight bars runs beside the name." src="assets/header-light.svg" width="100%">
</picture>

Hi, I'm Shivank.

I've spent seven years making web apps fast and pleasant to use. That's mostly React and TypeScript, including eight micro-frontends at New Relic and a product team at Zeda. These days I'm also building the other half: the LLM plumbing underneath.

One habit runs through all of it: if I give you a number, I'll show you how I got it.

### Things you can poke at

- **[shivumat.me](https://www.shivumat.me)**: move your pointer across my name and watch the type breathe.
- **[An AI tutor, checked by hand](https://www.shivumat.me/evals/step-tutor)**: I read 100 of its explanations against the algorithm step each one describes. None were wrong. But 100 is a small sample, so the honest upper bound is still 3.7%.
- **[@shivumat/tokens](https://www.npmjs.com/package/@shivumat/tokens)**: my design system. It has eleven moods, from a quiet reading page to a little physics toy, and every one passes its contrast checks.

### What I'm figuring out this winter

<details>
<summary><b>How much latency does an LLM gateway actually add?</b></summary>
<br>

I'm building one: routing, prompt caching, spending limits and fallback between providers. I'm measuring its overhead against LiteLLM with k6, and the target is under 15 ms at p95. The repo opens with the write-up, numbers included.

</details>

<details>
<summary><b>Can you trust an AI to grade another AI?</b></summary>
<br>

Only after checking it against people. eval-kit measures how often a judge model agrees with human labels before that judge is allowed to block a release in CI.

</details>

<details>
<summary><b>What does "at least once" cost when workers crash mid-job?</b></summary>
<br>

job-runner is a Postgres-backed job queue. I kill its workers on purpose and count what gets done twice and what gets lost (the answer should be nothing).

</details>

<details>
<summary><b>Can an incident agent show its working?</b></summary>
<br>

An on-call assistant where every sentence links to the log line, trace span or metric it came from. If it can't cite something, it doesn't say it.

</details>

<details>
<summary><b>Can you watch an algorithm think?</b></summary>
<br>

58 algorithms and data structures you step through one line at a time, on your own input, with an AI tutor you can check. It launches in January.

</details>

### Lately

<!-- live:start -->
- Latest write-up: the first one lands in December
- `@shivumat/tokens` downloads last week: none yet
- Checked 20 November 2026 by a GitHub Action
<!-- live:end -->

### Retired, lessons kept

I switched both of these off in November 2026 to stop paying their running costs. The write-ups stay.

- **[Check Is It AI](https://www.shivumat.me/#work-check-is-it-ai)**: it told you whether an image was AI-made. The fastest part was a forensic check that ran in your browser in under 200 ms and cost nothing to serve.
- **[LiquidHQ](https://www.shivumat.me/#work-liquidhq)**: it wrote Shopify sections from a prompt, streamed live, and checked them with liquidjs before anything reached the store.

[Say hello](https://www.shivumat.me/#contact)
