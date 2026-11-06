# Fetch — word games for Alf and Josie

Wordsearch, Word Guess and Crossword with shared looks, music, word packs, and per-player bones, ranks, badges and Kennel outfits for Buster.

- `page.html` — markup and styles, with script placeholders
- `music.js` — WebAudio music engine (8 styles) and sound effects
- `game.js` — profiles, Buster, Wordsearch, Word Guess, screens and settings
- `rewards.js` — bones, ranks, Kennel shop, badges
- `crossword.js` — clue lists and the crossword generator and player
- `init.js` — start-up
- `words5.txt` — five-letter words accepted as Word Guess guesses

Build: `python3 source/fetch/build.py` writes `fetch/index.html` (Game Box) and `source/fetch/fetch-artifact.html` (claude.ai preview). Bump `CACHE` in `fetch/sw.js` when publishing a change.

Saved data uses the `fetch.` localStorage prefix.
