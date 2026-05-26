# Toy Tabletop Plant Squad UI Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static browser UI prototype for 《玩具桌面植物小队》 so the menu, settings, level select, combat HUD, and modal states can be reviewed before Phaser gameplay implementation.

**Architecture:** A single HTML file under `prototypes/ui/` will hold the prototype markup, CSS theme, external public/open asset references, a lightweight CSS 3D background layer, and small view-switching script. It will not include game simulation.

**Tech Stack:** HTML, CSS, vanilla JavaScript.

---

### Task 1: Static UI Prototype

**Files:**
- Create: `prototypes/ui/index.html`

- [x] **Step 1: Create the prototype file**

Create `prototypes/ui/index.html` with:

- A toy tabletop themed shell.
- Main menu view.
- Level select view.
- Parent settings view.
- Combat HUD mock view with five lanes, plant cards, plants, zombies, and status chips.
- Pause, victory, and failure modal mock views.
- CSS variables for the toy palette.
- External public/open素材 references for realistic plant, zombie, sun, cone, bucket, newspaper, and food-object placeholders.
- Lightweight CSS 3D animated tabletop/grass layer behind the prototype shell.
- Small JavaScript functions to switch prototype views.

- [x] **Step 2: Verify static opening**

Open `prototypes/ui/index.html` in a browser and verify:

- Main menu appears first.
- Buttons switch between prototype states.
- Combat HUD keeps the middle playfield readable.
- Bottom plant cards stay fixed in height.
- Text does not overflow at desktop width.
- External asset images load in the DOM view.
- 3D animation layer loads without console errors.

- [x] **Step 3: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-05-26-ui-prototype.md prototypes/ui/index.html
git commit -m "Add UI prototype"
```
