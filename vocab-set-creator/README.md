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
| `cutter.js` | 🧩 Clipart sheet cutter (from Bingo Maker v17–v35): one picture with many cliparts → transparent pictures, words read from the captions |

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
- 🧩 Cut picture sheet: upload one picture with many cliparts → auto-cut into a grid (or along drawn grid lines / a saved 📐 template you can drag and save), captions removed, background made transparent (white inside the picture kept, thin white border). The word under each picture is read with free in-browser OCR (Tesseract.js, loaded from jsDelivr the first time) and put in its name box. Tick the pictures to keep → green = matches a word in the set (gets the picture), orange = new word (added, then auto-filled). Options: add new words, replace existing pictures. ⬇ ZIP of transparent PNGs.
- ✨ Auto-fill: IPA, meaning, emoji. With a Gemini key → Gemini. Without → dictionaryapi.dev (IPA), MyMemory (meaning), built-in emoji.
- Pictures: emoji search, upload, camera, paste, 🎨 AI picture (6 styles). Images are resized to 384 px WebP.
- Sentences / Talk / Stories tabs with format help, live preview (set words highlighted, IPA, missing meanings), ✨ AI make-from-words.
- Export one set / back up all (`.json`, pictures included). Import: set files, backups, and **old Bingo Maker backups** (`learn8-bingo-backup-*.zip` / `.json`): each Bingo game → one set with its pictures and translations.
- Gemini key is stored only in the browser (`localStorage`) and sent only to `generativelanguage.googleapis.com`.

## Layout (small-first)
iPhone mini 375: stacked word rows, bottom add bar, ⋮ sheet for print types/languages/export. iPad mini 744: one-line rows (picture · word · IPA · meaning). ≥1024 (iPad landscape / desktop): left panel with “Print as…” type grid, languages and export.

## ☁️ Online saving (english.learn8.co)
Live at **https://english.learn8.co/vocab/** (own site on the DigitalOcean droplet; learn8.co is not touched). The GitHub Pages copy can sign in to the same server.
- Tap **☁️ Sign in** (top bar). New account needs the invite code (kept in `/srv/english/data/config.php`). After sign-in every set on the device is uploaded, then kept in sync (on save after 1.5 s, on focus, every 60 s, when back online). Last change wins (`updated`). Deleting a set deletes it on all devices. Green dot = saved, orange = saving, red = offline/error.
- Pictures (`data:` images) are saved as files on the server (`/media/<user>/<sha1>.png|jpg|webp`) and the set keeps their URL, so sets stay small.
- Sync lives in `store.js` (`VS.cloud`): both the creator and the worksheet page use it.
- `server/`: `api.php` (PHP 8.3 + SQLite, actions register/login/me/logout/list/put/del, Bearer token), `nginx.conf` + `nginx-body.inc`, `php-pool.conf` (own pool in php8.3-fpm-sp), `setup.sh` (one time), `certbot.sh` (Let's Encrypt), `deploy.sh` (update the site from this repo: `bash /srv/english/deploy.sh`).
- Server files: `/srv/english/{public,data,logs}`, `/etc/nginx-sp/vhosts.d/english.conf`, `/etc/nginx-sp/english-body.inc`, `/etc/php8.3-sp/fpm-pools.d/english.conf`.

## Not yet
story pictures use the 3 built-in scenes · production should use the Breakie dictionary for IPA/meaning instead of the free APIs.
