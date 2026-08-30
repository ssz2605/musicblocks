# PerfSense: Performance Regression Detection for Music Blocks

**Author:** Shreya Saxena
**Status:** Validated on forked PRs (#14-#17, all expected outcomes); ready for upstream
**Scope:** Comment-only analysis. Never fails a check, never blocks a merge.

---

## 1. Purpose

Establish a performance contract for Music Blocks so future PRs can be automatically
checked for regressions across the app's real performance characteristics: startup,
project loading, save/export, audio scheduling, execution, queue pressure, memory,
and recursion depth.

Music Blocks already runs Lighthouse CI, but Lighthouse measures **page load** only.
It cannot see the Music Blocks runtime: how fast the interpreter executes, how much
memory a project uses, how precise multi-voice playback scheduling is, or whether
save/export is getting slower. PerfSense fills exactly that gap — it runs representative
real projects on every relevant PR and posts a comment with measured evidence.

Initial rollout is **comment-only and non-blocking**, validated first on a fork with
mock PRs before being offered upstream.

---

## 2. Benchmark Matrix

Six committed projects from `examples/`, each exercising one dimension of the app that
the others do not. No project is kept merely because it exists — each maps to a real
performance concern.

| Project | Purpose | Metrics |
| ------- | ------- | ------- |
| **Empty** | Isolates app startup cost | `bootstrapTotal`, `initTotal`, `heapAfterBoot` |
| **Rainbow Connection** (5.7k blocks, 1.5MB, largest in repo) | Project loading, save/export, memory; protects PR #7923 load-suppression optimization | `projectLoadTime`, `saveTime`, `exportMIDITime`, `memoryDelta`, `retainedHeap` |
| **Frère Jacques** (4-voice round) | Tone.js/Transport scheduling precision; protects PR #7703 scheduler migration | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError` |
| **musical-tree** (recursive fractal drawing) | Recursive/action-heavy execution, queue & memory stress | `maxQueueDepth`, `executionTime`, `memoryDelta`, `retainedHeap`, `maxDepth*` |
| **ascending-notes-color-spiral** (46 blocks, completes <1s) | Interpreter throughput / block execution — cheap full-run smoke signal | `executionTime`, `maxDepth*`, `blocksExecuted` |
| **crabcanon-plot** (2 staggered turtles) | Concurrent two-voice scheduling | `scheduleLagMean`, `scheduleLagMax` |

### Notes

- **`maxDepth*` is unverified** until its semantics are fixed. Today the instrument
  (`enterBlock`/`exitBlock` at `logo.js`) tracks JS call nesting of one function and
  always reads 1, regardless of program recursion depth — so it is tracked as a
  **sanity** field only, not a regression signal.
- **`maxQueueDepth`** (max `tur.queue.length` across turtles during a run, sampled per
  executed block) is the **real** recursion/scheduling-pressure signal. Musical-tree's
  recursive action calls explode the queue (hundreds of pending blocks) while linear
  songs stay flat. It catches runaway/infinite action loops early.
- **`blocksExecuted`** sanity-checks `executionTime`: a stable block count with rising
  time is a genuine slowdown; a changing block count means the workload itself changed.
- **Rejected fixtures** (with concrete reasons): chopsticks, animated-circles, and
  drum-machine have `forever` loops (never terminate, no stable window) or need clicks
  (`listen`/`myclick`). crabcanon/earth-song have no loops (thin on interpreter stress).
  Old-MacDonald uses audio-file media blocks (network/asset noise).
- **crabcanon-plot fallback:** `simple-crab-canon.html` (11KB / 180 blocks vs 45KB /
  900) has the identical 2-voice canon shape at ~4× cheaper CI cost. Swap if the larger
  variant's variance is high.

### Metric origins

| Metric group | Source in Music Blocks |
| ------------ | ---------------------- |
| `bootstrapTotal`, `initTotal` | `window.__mbPerf.measures` via `?mbPerf=1` (`js/loader.js`, `js/activity.js`) |
| `executionTime`, `maxDepth`, `memoryDelta` | `window.performanceTracker.getStats()` via `?performance=true` (`js/utils/performanceTracker.js`) |
| `projectLoadTime`, `saveTime`, `exportMIDITime` | Real UI interaction timing (`setInputFiles('#myOpenFile')` → poll-ready; Save/export menus) |
| `callbackLatency*`, `cumulativeDrift`, `voiceOnsetError` | Page-level injector wrapping the `synth.transport.schedule` seam (`js/logo.js:1781`) — the exact method PR #7703 used |
| `maxQueueDepth`, `blocksExecuted` | Page-level injector sampling `tur.queue.length` / counting `runFromBlockNow` |
| `heapAfterBoot`, `retainedHeap` | CDP precise memory + double-run retained-heap sampling (leak guard) |

---

## 3. Baseline Data Contract

Stored as **`baseline.json`**, holding the full **sample distribution** per metric
(not a single number) so the checker compares distributions rather than one sample
against one sample. This accounts for CI noise.

```json
{
  "schema": "perfsense/1",
  "capturedAt": "2026-08-24T09:12:00Z",
  "commitSha": "<main sha>",
  "runs": 5,
  "statistics": {
    "flagRule": "MannWhitneyU p<0.05 AND medianDelta>=threshold AND cliffsDelta>=0.147",
    "minRuns": 5
  },
  "runner": {
    "os": "ubuntu-latest",
    "chromeVersion": "137.x.x.x",
    "nodeVersion": "20.x",
    "playwrightVersion": "1.x"
  },
  "fixtureHashes": {
    "RainbowConnection.html": "<sha256>",
    "Frere-Jacques.html": "<sha256>",
    "musical-tree.html": "<sha256>",
    "crabcanon-plot.html": "<sha256>",
    "ascending-notes-color-spiral.html": "<sha256>"
  },
  "metrics": [
    {
      "fixture": "rainbow-connection",
      "metric": "projectLoadTime",
      "unit": "ms",
      "tier": "core",
      "samples": [4812, 4855, 4790, 4921, 4840],
      "median": 4840,
      "p25": 4812,
      "p75": 4921
    }
  ]
}
```

Contents in words: **metadata** (schema, capture time/commit, run count, flagging
rule), **runner identity** (so a Chrome/OS image bump is visible, not silent),
**fixture hashes** (an edit invalidates comparison), and **20 metric entries** — each
storing raw samples + precomputed median/quartiles.

The baseline is generated **on `main` by the same driver/environment as PR runs**, so
PR measurements differ only in code — that is the variable the comparison wants.
It is committed and diffable (no silent re-baselining), refreshed weekly via a
reviewable PR, and guarded by file hashes so editing a fixture cannot silently move it.

---

## 4. Repo Split

Two repos. The Music Blocks repo holds **data/config only** (no app code changes);
all framework code lives in PerfSense.

### Music Blocks repo (4 files, zero app-code changes)

```
musicblocks/
├── perfsense.config.json          # fixtures, metrics per fixture, scenarios, tiers,
│                                  #   runs=5, trigger paths, label overrides
├── baseline.json                  # approved CI baseline (Section 3), committed & diffable
├── perfsense-server.cjs           # static benchmark server (restore from demo/pr-7923)
└── .github/workflows/perfsense.yml
                                   # job 1 (PR): serve → 6 fixtures × 5 runs →
                                   #   check vs baseline.json → post comment (never fail)
                                   # job 2 (cron): weekly re-baseline on main →
                                   #   open "chore: refresh perf baseline" review PR
```

```jsonc
// perfsense.config.json (shape)
{
  "baseUrl": "http://127.0.0.1:3000",
  "runs": 5,
  "fixtures": [
    { "name": "empty",              "scenario": "bootstrap" },
    { "name": "rainbow-connection", "scenario": "open+save+export",
      "file": "examples/RainbowConnection.html" },
    { "name": "frere-jacques",      "scenario": "open+playToCompletion",
      "file": "examples/Frere-Jacques.html", "probes": ["transportLag"] },
    { "name": "musical-tree",       "scenario": "open+playToCompletion",
      "file": "examples/musical-tree.html", "probes": ["queueDepth"] },
    { "name": "ascending-spiral",   "scenario": "open+playToCompletion",
      "file": "examples/ascending-notes-color-spiral.html",
      "params": { "performance": "true" } },
    { "name": "crabcanon-plot",     "scenario": "open+playToCompletion",
      "file": "examples/crabcanon-plot.html", "probes": ["transportLag"] }
  ],
  "trigger": {
    "paths":  ["js/**", "css/**", "dist/**", "index.html", "lib/**"],
    "ignore": ["js/**/__tests__/**", "js/**/*.test.js"],
    "fixtures": ["examples/RainbowConnection.html", "..."]
  },
  "labels": { "forceRun": "perf", "skip": "skip-perf" }
}
```

### PerfSense repo (`github.com/ssz2605/PerfSense-AI`)

```
PerfSense-AI/
├── packages/metrics-musicblocks/src/
│   ├── readers/
│   │   ├── perfTracker.ts    # ?performance=true → performanceTracker.getStats()
│   │   │                     #   → executionTime, maxDepth, memoryDelta (with timeout→inconclusive)
│   │   └── bootstrap.ts      # ?mbPerf=1 → __mbPerf.measures (+ alias table)
│   │                         #   bootstrapTotal/initTotal → real measure keys
│   ├── injectors/
│   │   ├── transportLag.ts   # wraps synth.transport.schedule seam — PR #7703 method
│   │   │                     #   → callbackLatency, cumulativeDrift, voiceOnsetError
│   │   ├── queueDepth.ts     # samples tur.queue.length → maxQueueDepth
│   │   ├── heapSampler.ts    # CDP precise memory → heapAfterBoot/memoryDelta/retainedHeap
│   │   └── blockCounter.ts   # counts executed blocks → blocksExecuted
│   └── shared/ readyPoll.ts · heartbeat.ts · networkStub.ts
│
├── packages/driver-playwright/src/scenarios/
│   ├── bootstrap.ts          # navigate, wait app-ready
│   ├── openProject.ts        # setInputFiles('#myOpenFile') → poll blockList stable
│   ├── playToCompletion.ts   # click Play → await all turtles done
│   └── saveExport.ts         # drive Save menu → time save / MIDI export
│
├── packages/
│   ├── cli · core · statistics · correlation-engine
│   ├── evidence-trace · evidence-network · evidence-git-diff · git-blame
│   ├── reporter-github · github-action
│   └── ai-provider
│
└── examples/music-blocks/    # mock pages for framework self-tests (not the real repo)
```

Everything downstream — statistics (Mann-Whitney U, Cliff's delta), regression
classification, evidence collection (trace/network/diff/blame), correlation engine,
GitHub reporter, and optional AI — is already implemented and unchanged. The Music
Blocks integration is purely the **reader/injector + scenario** layer above.

---

## 5. PR Trigger Strategy

No dependency on a performance label or code ownership — regressions can come from
PRs nobody flags as performance-related.

```
PR → Clearly inert (docs/tests/i18n/assets)?
         Yes → Skip
         No  → Run PerfSense → Compare to baseline → post comment
```

- **Default = run; skip only provably inert classes** (`__tests__/**`, `*.test.js`,
  `locales/`, docs, sounds, images, `.github/`).
- Rationale: Music Blocks boots via RequireJS, which executes essentially every module
  in `js/` before the first Bootstrap measurement completes. So any file that ships and
  executes sits on a **measured path by construction** — almost any code change can
  plausibly affect a metric.
- This makes the filter **fail-safe**: a brand-new runtime file is covered by default
  and cannot silently bypass PerfSense. No hand-maintained allowlist to rot.
- Overrides: `perf:` label forces a run even on docs-only; `skip-perf` opts out.
  Changes to benchmark fixtures themselves trip the hash check and invalidate the
  comparison (never benchmarked against a stale baseline).
- Trade-off explicitly accepted: occasional extra CI runs (false positives, ~4–6 min,
  comment-only) are cheap compared to a missed regression that ships and is only found
  by manual bisect weeks later.

---

## 6. Fork Validation Plan (before upstream)

Four mock PRs on a fork, each exercising one behavior:

| Mock PR | Change | Expected Result | Result |
| ------- | ------ | --------------- | ------ |
| 1 | Docs-only | PerfSense skipped silently | ✅ PR #14: skipped, no comment |
| 2 | Normal JS change | Runs, stays green | ✅ PR #15: PASS, green on all 6 fixtures |
| 3 | Intentional loading regression (4 s main-thread stall in `loadNewBlocks`, `js/blocks.js`) | Regression detected on `projectLoadTime` | ✅ PR #16: `projectLoadTime` +54.4% / +54.6% flagged `:x:` on both loading fixtures |
| 4 | Hot-path-only JS touch (`js/logo.js`) | Runs, metrics green; hot-path advisory note expected | ✅ Runs, green (PR #17) — advisory note **not implemented yet** (documented gap, optional polish) |

> Mock PRs #14-#17, all closed unmerged on `ssz2605/musicblocks` (2026-08-30). Locally
> pre-verified before triggering CI: 4 s stall → single-fixture median +70% vs baseline
> (runs=5, p=0.009). The earlier candidate injection point (disabling the
> `_suppressRefresh` guard) was rejected because it made `projectLoadTime` *faster*
> (4978 ms) — the guard is not actually exercised during measured project load.

Flow per run:

```
PR → GitHub Actions → static serve → Music Blocks benchmark (6 fixtures × 5 runs)
→ probe/metric collection → PerfSense-AI statistical comparison vs baseline.json
→ PR comment (table + evidence)
```

If all four behave as expected, the same setup is ready for upstream.

---

## 7. Sample PR Report (illustrative only)

```
## PerfSense Performance Report
PR #8071 · Baseline: main@f12adad · Comment-only, merge not blocked

Fixture              Metric               Baseline   PR      Δ       Status
-------------------- -------------------- --------- ------- ------- ------
Rainbow Connection   projectLoadTime      4.82 s    5.61 s  +16.4%  🔴 Regression
Rainbow Connection   saveTime             812 ms    819 ms  +0.9%   ✅
Frère Jacques        callbackLatencyMean  12.1 ms   12.4 ms +2.5%   ✅
ascending-spiral     executionTime        743 ms    691 ms  −7.0%   🟢 Improved

Evidence (projectLoadTime): trace shows ~1,400 intermediate stage.update()
calls absent from baseline → _suppressRefresh lifecycle broken (PR #7923 class)
→ changed files js/blocks.js, js/activity.js
```

---

## 8. Special-Treatment Metrics

| Tier | Metrics | Why |
| ---- | ------- | --- |
| **Warn-only initially** (need ≥10 CI runs to characterize variance before trust) | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError`, `memoryDelta`, `retainedHeap` | Audio and memory metrics are noise-sensitive in headless CI |
| **Core (protected from day one)** | `bootstrapTotal`, `initTotal`, `projectLoadTime`, `maxQueueDepth`, `executionTime` (musical-tree, ascending-spiral), `blocksExecuted` | Stable, reproducible, sensitive to hot-path changes |
| **Sanity / unverified** | `maxDepth` | Not reliable until action-recursion semantics are fixed; tracked but not gated |

**Warn-only forever (do not hard-gate):** all audio-derived and memory metrics — CI
cannot reliably measure them, and PerfSense never blocks merges anyway.

**Do NOT baseline:** raw `executionTime` on song-length pieces (Rainbow Connection,
Frère Jacques) — it includes note waits and measures tempo, not interpreter CPU.
Wall-clock audio drift/playback latency — headless fake-audio is environment noise,
replaced by the deterministic Transport-clock metrics (`callbackLatency*`,
`cumulativeDrift`). TTFB/FCP/LCP — Lighthouse CI already owns these. Absolute heap
bytes — GC-noisy; keep deltas and warn-only.

---

## 9. Statistics / Flagging Rule

- **Mann-Whitney U** (p < 0.05): is the PR distribution genuinely different from the
  baseline, or is it sampling noise?
- **Median delta ≥ 10%** (timing) / **≥ 15%** (memory), and
  **Cliff's δ ≥ 0.147** (at least a small effect): is the shift large enough to matter?

A +0.5% change that is statistically significant is reported, not failed; a +15% shift
with strong effect size is flagged loudly. This is the difference between a perf tool
that cries wolf and one developers trust. Exact thresholds are provisional until the
first ~10 CI baseline runs on the pinned runner provide real variance data.

---

## 10. Status

- Design and metric selection complete and verified against the repository.
- Framework (CLI, driver, statistics, evidence, correlation, reporting, AI) already
  implemented in PerfSense-AI.
- Baseline captured on the upstream-pinned runner (6 fixtures × 5 runs), PR #13,
  `baseline.json` on `origin/master`.
- Fork validation complete (2026-08-30): all four mock PRs (#14-#17) behaved as
  documented in Section 6 — docs-skip, green PASS, REGRESSION flagged on an
  intentional loading regression, hot-path green. All closed unmerged.
- Known gaps to polish later (non-blocking): hot-path advisory note for hot-path-only
  changes; `cumulativeDrift`/`maxQueueDepth` report rows render sign artifacts when the
  baseline value is 0.
- Next step: offer upstream to `sugarlabs/musicblocks` (LICENSE/AGPL headers first,
  then a PR carrying the separated repo split from Section 4).
