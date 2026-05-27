# Packaging And Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split production bundles into readable engine/app chunks and add a repeatable production preview checklist.

**Architecture:** Add `vite.config.ts` with an exported `manualChunks` helper, test it from Vitest, document production preview steps, and update the roadmap with M7 evidence.

**Tech Stack:** Vite, Rollup manual chunks, TypeScript, Vitest, Vite preview, Playwright browser smoke checks.

---

### Task 1: Bundle Chunk Strategy

**Files:**
- Create: `vite.config.ts`
- Create: `src/build/viteConfig.test.ts`

- [x] **Step 1: Write failing tests**

Add tests proving Phaser ids map to `engine-phaser`, Three ids map to `engine-three`, app source ids stay in the entry chunk, and the warning limit is engine-sized.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/build/viteConfig.test.ts
```

Expected: fail because `vite.config.ts` is not present yet.

- [x] **Step 3: Implement Vite config**

Export `manualChunks(id)` and configure `build.rollupOptions.output.manualChunks` plus `chunkSizeWarningLimit`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/build/viteConfig.test.ts
```

Expected: the new config tests pass.

### Task 2: Production Preview Checklist

**Files:**
- Create: `docs/production-preview-checklist.md`

- [x] **Step 1: Add checklist**

Document the repeatable private-share preview flow: tests, build, preview server, desktop smoke, mobile smoke, console check, touch controls, modal check, and asset-source review.

### Task 3: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m7-packaging-performance.md`

- [x] **Step 1: Update roadmap**

Mark M7 complete and list the delivered bundle split, warning assessment, checklist, and preview verification.

- [x] **Step 2: Mark plan complete**

Check off completed steps in this plan.

- [x] **Step 3: Run verification**

Run:

```bash
npm test
npm run build
npm run preview -- --port 4173
```

Then use browser smoke checks on desktop and mobile viewports, followed by:

```bash
git diff --check
```

Expected: all pass and production preview console has 0 warnings/errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/project-roadmap.md docs/production-preview-checklist.md docs/superpowers/specs/2026-05-27-m7-packaging-performance-design.md docs/superpowers/plans/2026-05-27-m7-packaging-performance.md vite.config.ts src/build/viteConfig.test.ts
git commit -m "Split production engine chunks"
```
