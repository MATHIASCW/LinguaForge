# LinguaForge

LinguaForge is a dependency-free vocabulary game for practicing translations through short monster battles. Every answer is a hit: correct words crush the monster with a hammer, award XP, and are scheduled for spaced repetition.

## Features

- Translation practice between French, English, Spanish, Japanese, Chinese, and Russian
- 110 vocabulary cards covering family, food, travel, objects, nature, people, actions, adjectives, and time
- Spaced repetition with six mastery levels
- Battle mode with lives, streaks, XP, hints, autocomplete, and retry queues
- Free practice mode for random review
- Calendar view for scheduled cards and battle history
- Bestiary view showing mastery progress
- English interface with localized vocabulary prompts
- Color-blind mode with a high-contrast palette and non-color feedback
- Reduced-motion support through `prefers-reduced-motion`
- No build step, backend, or external runtime dependency

## Run locally

Open [Mots-Monstres.html](./Mots-Monstres.html) in a modern browser. For the most reliable local-storage behavior, serve the folder with any static file server:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/Mots-Monstres.html`.

## Project structure

| File | Responsibility |
| --- | --- |
| `Mots-Monstres.html` | Semantic application shell and accessible controls |
| `styles.css` | Layout, themes, responsive rules, accessibility modes, and animations |
| `app.js` | State management, battle rules, rendering, calendar, translations, and event wiring |
| `data/vocabulary.js` | Structured vocabulary records for all supported languages |
| `data/i18n.js` | English and French interface translations |

The application keeps progress in `localStorage` under the `mots-monstres-v1` key. Resetting progress removes cards, calendar history, XP, and the best streak from the current browser.

Vocabulary is maintained as structured records in `data/vocabulary.js`. Each record contains English, French, Spanish, Japanese, Japanese romaji, Chinese, Chinese pinyin, Russian, and Russian transliteration. Adding a word does not require changing the game logic.

## Gameplay

1. Select the language spoken by the monster and the language for your answer.
2. Start a battle or choose free practice.
3. Type the translation and press **Attack**.
4. Use **Hint** when needed. Hints reduce the XP reward.
5. Correct answers reschedule a card using 1, 2, 4, 8, 16, and 32 day intervals.
6. Missed answers return during the current day and cost one life.
7. The battle continues through new rounds until all lives are lost or **Finish** is pressed.

## Accessibility

The interface uses semantic labels, keyboard-accessible controls, visible focus states, live feedback for battle results, pronunciation hints for non-Latin scripts, and reduced-motion behavior. Enable **Color-blind mode** in Settings to use a high-contrast palette that does not rely on color alone.
