---
name: world-legal-desk
description: Read and quote statutes from the World Legal Desk library, which keeps one folder of Markdown files per country. Use it to find the law of a named country, quote an article with its citation, list what countries the library covers, or compare how two jurisdictions word the same rule. It only reads the library folder on this computer and downloads nothing.
---

# World Legal Desk

The library is a folder of Markdown that the user keeps. It is not downloaded by this skill and
not fetched from the network: read what is on disk, and say so when a country is missing.

## Layout

```
<library root>/
  <country-code>/           one folder per country, 20 or more
    README.md               what corpus this folder came from, its version or date, its licence
    <law-slug>.md           one law or code per file
```

- A country folder is named with a two-letter lowercase code that follows ISO 3166-1 alpha-2:
  `de`, `fr`, `jp`, `br`, `za`, `in`. Lowercase, no country name, no spaces.
- `README.md` inside a country folder is the only place that says where the text came from and
  under which licence. Read it before quoting, and carry its attribution into the answer.
- A law file is named after the law in kebab case (`basic-law.md`, `civil-code.md`,
  `labour-code.md`), never after a date or a number.
- Headings follow the corpus: `# <law title>`, `## Part`, `## Chapter`, `### Article N`, and the
  article body underneath. Article numbers stay in the corpus's own form (§ 823, Art. 1382, 第709条)
  and are never renumbered or translated into another style.
- The text is Markdown only. There are no front matter keys, no JSON sidecars, and no generated
  index. The folder listing is the index.

## How to answer

1. Resolve the country to its folder code, and list the folder when you are unsure of the file name.
2. Grep the folder for the article number or the phrase, rather than reading a whole code: a corpus
   file can be megabytes.
3. Quote the article text exactly, then give the citation as `<country code>/<law-slug>.md`,
   the article heading, and the attribution line from that folder's `README.md`.
4. Mark the answer as a copy of a corpus, not legal advice, and name the corpus version or date from
   the country `README.md`. A law changes; a library copy may be older than the amendment.
5. For a comparison, quote both articles side by side and let the wording differ. Do not harmonise
   terms such as "legal person" or "reasonable notice" into one meaning when the two corpora do not.

## What not to do

- Do not write into the library. It is the user's copy; edits destroy the record of what the corpus
  said.
- Do not download a corpus, run a scraper, or fetch a law from the web to fill a gap. If a country is
  absent, say which countries the library has and stop.
- Do not present a paraphrase as a quote, and do not drop the attribution.
