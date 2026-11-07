# Skill: World Legal Desk

This folder is the skill the World Legal Desk listing installs. It holds the instructions an agent
reads, and the folder convention the library follows. It holds no law text: the corpora stay in the
user's own library folder, and nothing here downloads them.

## Files

```
skills/world-legal-desk/
  README.md                     this file: the per-country folder convention
  SKILL.md                      what the agent reads
  examples/                     three small entries in the convention's shape
    de/README.md
    de/basic-law.md
    fr/civil-code.md
    jp/README.md
```

`examples/` is documentation, not corpus data. Each file is a stub written in this repository: a few
lines in the layout the real corpus uses, so the convention is unambiguous. No example is a copy of
a statute, and no example is cited as one.

## The library root

The listing points a filesystem server at one folder and no other:

```
~/Documents/world-legal-desk/laws
```

Change the argument in `plugin.json` to point at a library elsewhere; a listing is the same for
every user, so the path has to be a sensible default rather than a real person's folder.

## One folder per country

```
laws/
  de/
  fr/
  jp/
  ...                         20 or more country folders
```

- The folder name is the ISO 3166-1 alpha-2 code in lowercase: `de`, `fr`, `jp`, `br`, `in`, `za`.
  Not the country name, not the alpha-3 code, not a mix.
- A country folder holds a `README.md` and one Markdown file per law.
- The library root holds no law files of its own, so a stray file there is never mistaken for one.

## What a country README.md says

| Line | Why |
| --- | --- |
| Corpus name and its source URL | The reader must be able to find the upstream text. |
| Corpus version or date | A law changes; an undated copy cannot be trusted. |
| Licence | The corpora carry their own terms, and a quote must keep them. |
| What the folder covers | "Civil code only", or "the consolidated statutes to 2024". |

## What a law file looks like

- Named in kebab case after the law: `basic-law.md`, `civil-code.md`, `labour-code.md`.
- Headed `# <law title>`, then `## Part`, `## Chapter`, then `### Article N`, then the body.
- Article numbers keep the corpus's own form: `§ 823`, `Art. 1382`, `第709条`. Never renumbered,
  never rewritten into another style.
- Plain Markdown only. No front matter, no JSON sidecar, no generated index: the folder listing is
  the index.

## Adding a country

1. Create the country folder under the library root, named with the lowercase alpha-2 code.
2. Write the folder's `README.md` with the corpus name, source URL, version or date, and licence.
3. Add one Markdown file per law, in the shape above.
4. Commit nothing from this repository: the library is the user's copy, outside this project.

Do not scrape, download, or generate a corpus to fill a folder. The owner's rule for this listing is
that it ships the catalog entry and the convention, and the law text is something the user brings.
