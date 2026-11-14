# Two Bits Apart: website

The brand site for the **Two Bits Apart** podcast. Every episode's slides live here, and you present straight from the site.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site → ./out (deploy to Vercel / Netlify / GitHub Pages)
```

## Presenting an episode

Open an episode → **▶ Present** (or `/episodes/<slug>/present/#<slide>`).

| Key | Action |
| --- | --- |
| → Space PgDn | next build step / slide |
| ← PgUp | previous |
| F | fullscreen |
| P | presenter window: current + next slide, notes, timer (stays in sync with the main window) |
| N | notes overlay |
| O | overview grid of all slides |
| B or . | blackout |
| ? | shortcut help |

Typical recording setup: share the main window fullscreen and keep the **P** presenter window on your laptop screen.
Clickers send PgUp/PgDn, so they work even after you've used a slider.

## Where things live

```
src/site.config.ts                 ← host names, bios, channel links (placeholders, edit me)
src/content/episodes.ts            ← episode list (title, status, topics)
src/episodes/ep01-*.tsx            ← Episode 1 slides + speaker notes
src/episodes/registry.ts           ← maps episode slug → slide deck
src/components/deck/               ← presentation engine (player, primitives, reveals)
src/components/widgets/            ← interactive slides (pixel grid, neuron, softmax, gradient descent)
```

## Adding Episode 2 (micrograd)

1. Copy `src/episodes/ep01-neural-networks-and-mnist.tsx` → `ep02-micrograd.tsx`, then write slides.
   Each slide is `{ id, title, steps, notes, chapter, Component }`; wrap content in `<R at={n}>` to reveal it at build step `n`.
2. Register the deck in `src/episodes/registry.ts`.
3. Set `status: "published"` for `micrograd` in `src/content/episodes.ts`.
