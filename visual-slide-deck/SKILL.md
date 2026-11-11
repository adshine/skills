---
name: visual-slide-deck
description: Build or redesign a slide deck as fixed 16:9 HTML slides that are visual, say one thing each, and export 1:1 to PDF. Use when asked to make, redesign or fix slides, a pitch deck, a company profile or a presentation, when a deck is called lazy, busy, repetitive or "not visual", or when the user sends a reference image and says "learn from this".
license: MIT
metadata:
  tags: slides, deck, presentation, company-profile, pitch-deck, layout, illustration, pdf
---

# Visual Slide Deck

Turn content into a deck where every slide says one thing, almost every slide carries a picture, and the browser view is exactly what the PDF prints.

## When to use

- A new deck, pitch, company profile or presentation.
- A redesign of slides someone called lazy, busy, repetitive, ugly or "not visual".
- A reference image arrives with "learn from this" or "like this".

Not for: long reports people read by scrolling, dashboards, or decks that must be edited in PowerPoint or Keynote.

## The order of work

Do these in order. Each step removes a class of rework from the steps after it.

### 1. Cut the content before designing anything

1. List every slide's single point in one line. A slide with two points is two slides or one cut.
2. Count repeated phrases and repeated ideas across the whole deck (a search and a count, not a feeling). The same story told on several slides is the usual fault: for example "find, build, train, support" as a tagline, a list, a process and a price table.
3. Merge or cut until each idea appears once. Show the before and after counts.
4. Rewrite headlines as the claim itself ("Manual work is costing you time and money"), not a topic label ("The problem").

### 2. Treat a reference image as the spec

When the user sends a reference, copy its structure and scale, not its mood: where the big thing sits, how much of the slide it takes, how text is grouped, what the grid is. State in a table what you took from it and what you left out, and why.

### 3. Build on a fixed canvas

Use `templates/deck.html` as the skeleton.

- Every slide is a fixed 1440 by 810 box (16:9), scaled to fit the window, moving sideways one at a time. Never let slides stretch with the window.
- Size things in px or container units (`cqw`, `cqh`) inside the slide, never `vw` or `vh`, so the slide is the same at every window size.
- Print rules make each slide one 1440 by 810 page, so screen and PDF are identical.
- One theme. No dark-mode variant: the reviewer must see what the PDF will show.

### 4. One scale, one grid

- Sizes step by the golden ratio: 16, 26, 42, 68, 110, 178. Body text 16 at minimum, slide titles 68, cover and closing titles 110. Margins, gaps and picture sizes come from the same list.
- A 12-column grid with 24 between columns sets every edge. Headline and the block beside it start on the same line.
- Splits use the same ratio where they can (for example 890 | 550 across, 500 | 310 down).

### 5. One illustration style across the deck

Pick one style and use it on almost every slide. Pictures are what make a deck "visual"; type alone reads as a document.

- Full-bleed plates for cover and close, single isolated objects for tiles and lists.
- **Every picture is made for this deck.** Never carry a plate over from another deck or leave the template's file names in place: a cover or closing picture that does not show what its slide says is wrong, however good it looks.
- Write the deck's picture list in `pictures.json` next to the deck: the style, an optional reference image, and for each picture its `name`, `kind` (plate or object), `subject`, and `for` (the slide's own point). Nothing about the pictures lives in the skill.
- Generate with `node scripts/make_pictures.mjs pictures.json`. It uses the `agy` CLI. If `agy` is not installed it stops and tells the person to install it and sign in. `--route codex` is the second route (Codex CLI with the imagegen skill) for when the image quota runs out mid-set.
- **Agree the world of the pictures before generating.** Put it in `"world"` in `pictures.json`: the setting, the class of place, how people dress. Take it from the brand and the audience, never from a guess about geography. For a professional or tech audience the default is modern: glass and steel buildings, clean interiors, people in tailored business dress. A reference image passes on its setting as well as its line work, so pick one whose setting is also right.
- **Review every generated picture before it goes on a slide.** Open each one at full size and check all of these. Any "no" means regenerate with `--only <name> --force`, not ship:
  1. Is it actually new? The script moves the old file to `.previous.png` and only reports "made" for a file written in this run. If it says FAILED, the quota is gone: switch route.
  2. Does it show what its `for` line says?
  3. Does it match the agreed world (setting, dress, level of polish)?
  4. Does anything look uncanny: hands, fingers, faces, limbs, odd poses, objects doing impossible things? Prefer figures small, from behind or at a distance, hands out of view.
  5. Is it free of stray text, logos, a drawn border, or a different drawing style from the rest of the set?
  6. Would this audience be glad to be pictured this way?
- Say in the report which pictures were reviewed and which were regenerated, and why.
- Clean single objects to greyscale with pure white ground, then blend them into their tile (`mix-blend-mode: multiply`). Crop any frame or border the model drew around a plate.
- Never invent faces of real people. Use initials or real photos. Generic figures are fine, best seen from behind.

### 6. Layouts that hold up

| Job | Layout |
|---|---|
| Cover | Dark full slide, one plate edge to edge on the smaller side of the split, title bottom left, almost no other text |
| One claim | Huge headline anchored to the bottom, a faint plate behind or beside it |
| Three or four parallel items | Even tiles: one object centred, name and one sentence at the foot |
| Results | Even tiles: the result (number or word) as the hero, one sentence that finishes it, one object |
| A list with a picture | Wide plate across the top, headline on columns 1 to 5, items on 6 to 12 |
| A process | Three objects standing on one thin line, a name and one sentence under each, one accent marking the decision point |
| People | Tiles with large initials (or photos), name, role, one line |
| Close | The cover's bookend: same split, the other plate, the call to action as a heading above the contact details |

### 7. Things that get rejected

- Ruled rows and tables, including "typographic" ones. They read as spreadsheets.
- Empty boxes with a word at the top and a line at the bottom.
- Lines and borders between sections, and decorative line work.
- Small grey text with big empty space around it.
- The same layout rhythm on every slide with no slide that gives one thing the whole screen.
- Secondary labels, counters and captions that the layout does not need.
- Buttons in a document that will be a PDF.

### 8. Verify before saying done

Run `scripts/check_deck.mjs <deck.html> <out-dir>`. It measures every slide (no content past the slide edge, no broken images) and writes one screenshot per slide plus a contact sheet. Then look at every slide yourself. A fit check passing is not the same as the slide looking right. Zoom in on anything tight: highlights cutting into the line above, stacked display lines colliding, captions wrapping to an orphan word.

### 9. Review by comment

Publish the deck somewhere the user can comment on a slide and send the comment to you. Then:

- A short comment on one element changes that element only.
- If a comment's target is unclear ("remove this"), remove the smallest plausible thing, say what you assumed, and never remove a whole slide on a guess. It is usually a line or a border.
- When copy is rejected, offer two or three short alternatives and apply the pick everywhere it appears.
- Claims stay true under pressure: if the user wants a stronger line than the facts support, write the strongest honest version and say what you held back.

### 10. PDF last, and only when asked

Run `scripts/export_pdf.mjs <deck.html> <out.pdf>`. Check the page count, give the file a proper name and document title, search its text for anything that was meant to be removed, and look at every page before it goes anywhere.

## Files

- `templates/deck.html`: the fixed-canvas skeleton (scale to fit, sideways navigation, print rules, size scale, grid, tile and plate classes).
- `scripts/make_pictures.mjs`: generate the deck's pictures from its `pictures.json`. Needs the `agy` CLI (or `--route codex`), and says so plainly when it is missing.
- `scripts/check_deck.mjs`: measure and screenshot every slide. Needs Playwright (`pnpm add playwright` next to the script, or run from a folder that has it).
- `scripts/export_pdf.mjs`: print the deck to a 16:9 PDF, one slide per page.

## Non-goals

- Editable PowerPoint, Keynote or Google Slides files.
- Motion and transitions.
- Writing the business content: it restructures and trims what it is given, and flags claims it cannot source.
