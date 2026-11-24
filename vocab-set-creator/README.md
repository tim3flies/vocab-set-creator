# Bokogo · Vocab Set Creator

Make vocabulary sets and print them as worksheets. Static site (no server, no build step): runs on GitHub Pages.

**Live:** https://tim3flies.github.io/vocab-set-creator/

| File | What it is |
|---|---|
| `index.html` | **Vocab Set Creator** (came from the old Bingo Maker): library of sets + editor |
| `worksheets.html` | **Printable worksheets** (Bokogo Games › Create & print, all types L1–L3, S1–S3, R1–R7, W1–W5, Custom) reading the chosen set |
| `store.js` | Shared storage: IndexedDB `bokogo-vocab` / store `sets` (same origin, so both pages see the same sets) |
| `ws-sets.js` | Loads the chosen set into the worksheet page (`?set=ID`, else the last set opened) + topic picker |
| `emoji.js` | ~640 common words → emoji (picture fallback without AI) |

## A vocab set
```json
{ "id": "…", "name": "Fruits", "icon": "🍎", "lang": "en", "mt": "th",
  "words": [{ "id": "…", "w": "apple", "ipa": "ˈæp.əl", "m": "แอปเปิล", "e": "🍎", "img": "data:image/webp;base64,…" }],
  "sen": "I like [apples]. | ฉันชอบแอปเปิล\n…",
  "dlg": "What fruit do you like? | I like mangoes.\n…",
  "sto": "[pic:park]\nTom is at the park…\nQ: Where is Tom? | at the park / park | Tom is at the park.",
  "ipa": { "like": "laɪk" } }
```
- `words` → worksheet `W` rows `[word, picture, IPA]` (picture = uploaded/AI image, else emoji).
- `sen` / `dlg` / `sto` → the worksheet's shared 📝 Sentences, 💬 Dialogues and 📖 Stories boxes (same text formats). Edits made in those boxes on the worksheet page are saved back to the set.
- No sentences/dialogues yet → simple ones are made from the words (`This is a [word]. | นี่คือ…`, `What is this? | It is a word.`).
- `ipa` = extra IPA for words used in sentences (S3 Read Aloud, teacher scripts).

## Creator features
- Words: type / paste many lines (`word | meaning | ipa`, Excel columns ok) / AI word list from a prompt / drop pictures (file name = word).
- ✨ Auto-fill: IPA, meaning, emoji. With a Gemini key → Gemini. Without → dictionaryapi.dev (IPA), MyMemory (meaning), built-in emoji.
- Pictures: emoji search, upload, camera, paste, 🎨 AI picture (6 styles). Images are resized to 384 px WebP.
- Sentences / Talk / Stories tabs with format help, live preview (set words highlighted, IPA, missing meanings), ✨ AI make-from-words.
- Export one set / back up all (`.json`, pictures included). Import: set files, backups, and **old Bingo Maker backups** (`learn8-bingo-backup-*.zip` / `.json`): each Bingo game → one set with its pictures and translations.
- Gemini key is stored only in the browser (`localStorage`) and sent only to `generativelanguage.googleapis.com`.

## Layout (small-first)
iPhone mini 375: stacked word rows, bottom add bar, ⋮ sheet for print types/languages/export. iPad mini 744: one-line rows (picture · word · IPA · meaning). ≥1024 (iPad landscape / desktop): left panel with “Print as…” type grid, languages and export.

## Not yet
Sets live on one device (no account/cloud sync) · story pictures use the 3 built-in scenes · production should use the Breakie dictionary for IPA/meaning instead of the free APIs.
