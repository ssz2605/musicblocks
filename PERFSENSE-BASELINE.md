# PerfSense: Performance Regression Detection for Music Blocks

**Author:** Shreya Saxena
**Status:** Probe corrections merged on fork; full 9-scenario re-validation on the
corrected baseline in progress (see §6). Not yet offered upstream.
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
| **Rainbow Connection** (5.7k blocks, 1.5MB, largest in repo) | Project loading, save/export; protects PR #7923 load-suppression optimization | `projectLoadTime`, `saveTime`, `exportMIDITime`, `saveAsLilypondTime` |
| **Frère Jacques** (4-voice round) | Tone.js/Transport scheduling precision; protects PR #7703 scheduler migration | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError`, `scheduleCount` |
| **musical-tree** (recursive fractal drawing) | Recursive/action-heavy execution, queue & memory stress | `maxQueueDepth`, `executionTime`, `memoryDelta`, `retainedHeap`, `maxDepth` (unverified), `maxLogicalDepth` |
| **ascending-notes-color-spiral** (46 blocks, completes <1s) | Interpreter throughput / block execution — cheap full-run smoke signal | `executionTime`, `maxDepth` (unverified), `blocksExecuted`, `maxLogicalDepth` |
| **crabcanon-plot** (2 staggered turtles) | Concurrent two-voice scheduling | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError` |

### Notes

- **`maxDepth`** is **sanity-tracked only**, not a regression signal. The instrument
  tracks synchronous JS call nesting of `runFromBlockNow`; it is not reliable for
  program recursion depth. Program-level nesting is covered by `maxLogicalDepth`
  below instead.
- **`maxLogicalDepth`** (max per-turtle `queue.length + parentFlowQueue.length`
  during a run, measured exactly at every executed block via the engine's own
  `ithTurtle` resolution) is the **real recursion/scheduling-pressure signal**.
  The engine executes flow recursion iteratively, so this depth is exact —
  musical-tree's recursive action calls reach ≈254 while linear songs stay flat.
  It catches runaway/infinite action loops early and is what a recursion-regression
  PR moves. (Local probe validated; CI variance characterized by the baseline
  refresh that carries this metric.)
- **`maxQueueDepth`** (max per-turtle `queue.length` across turtles during a run,
  sampled per executed block) tracks raw queue accumulation, e.g. a queue-ladder
  regression (validated in §6 scenario D). Both samplers read the real turtle array
  (`window.__mb.turtles.turtleList`); previously they looked at a legacy `.turtles`
  property that does not exist on the container, so `maxQueueDepth` read 0 on real
  runs — fixed in the probe-correction commit. The queue samplers are sampled on a
  25 ms interval; `maxLogicalDepth` is captured per executed block.
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
| `projectLoadTime`, `saveTime`, `exportMIDITime`, `saveAsLilypondTime` | Real UI interaction timing (`setInputFiles('#myOpenFile')` → poll-ready; Save/export menus; MIDI + LilyPond export bridges) |
| `callbackLatency*`, `cumulativeDrift`, `voiceOnsetError`, `scheduleCount` | Page-level injector wrapping the `synth.transport.schedule` seam (`js/logo.js:1781`) — the exact method PR #7703 used |
| `maxQueueDepth`, `blocksExecuted` | Page-level injector sampling `tur.queue.length` / counting `runFromBlockNow` |
| `maxLogicalDepth` | Page-level injector sampling per-turtle `queue.length + parentFlowQueue.length` at every `runFromBlockNow` entry (engine's own `ithTurtle` resolution) — exact program recursion depth |
| `heapAfterBoot`, `retainedHeap` | GC-forced heap reads: Chromium launched with `--js-flags=--expose-gc` and `window.gc()` runs before each read, so `memoryDelta`/`retainedHeap` reflect real retained bytes (headless unforced reads returned stale zeros) |

---

## 3. Baseline Data Contract

Stored as **`baseline.json`**, holding the full **sample distribution** per metric
(not a single number) so the checker compares distributions rather than one sample
against one sample. This accounts for CI noise.

```json
{
  "schema": "perfsense-baseline-v1",
  "createdAt": "2026-08-30T14:47:17.635Z",
  "runs": 5,
  "pages": {
    "index.html": {
      "bootstrapTotal": {
        "median": 5540.9,
        "p10": 5519.9,
        "p90": 5546.1,
        "values": [5547.5, 5544, 5518.9, 5521.4, 5540.9]
      }
    },
    "RainbowConnection.html": {
      "projectLoadTime": {
        "median": 6659.9,
        "p10": 6653.3,
        "p90": 6667.5,
        "values": [6660.2, 6659.9, 6655.8, 6672.3, 6651.6]
      }
    }
  },
  "source": "cli benchmark --out results.json",
  "commitSha": "<main sha>",
  "runner": {
    "os": "ubuntu-latest",
    "chromeVersion": "151.x.x.x",
    "nodeVersion": "20.x"
  },
  "statistics": {
    "flagRule": "MannWhitneyU p<0.05 AND medianDelta>=threshold AND cliffsDelta>=0.147",
    "minRuns": 5
  },
  "fixtureHashes": {
    "RainbowConnection.html": "<sha256>",
    "Frere-Jacques.html": "<sha256>",
    "musical-tree.html": "<sha256>",
    "crabcanon-plot.html": "<sha256>",
    "ascending-notes-color-spiral.html": "<sha256>"
  }
}
```

Contents in words: **metadata** (schema, capture time/commit, run count, flagging
rule), **runner identity** (so a Chrome/OS image bump is visible, not silent),
**fixture hashes** (an edit invalidates comparison), and a **pages-keyed map**: for
each measured page, each metric stores its raw samples plus precomputed
median/p10/p90. The checker compares the PR run's distribution against the stored
samples for the same page+metric.

The baseline is generated **on `main` by the same driver/environment as PR runs**, so
PR measurements differ only in code — that is the variable the comparison wants.
It is committed and diffable (no silent re-baselining), refreshed weekly via a
reviewable PR, and guarded by file hashes so editing a fixture cannot silently move it.

---

## 4. Repo Split

Two repos. The Music Blocks repo holds **data/config only** (no app code changes);
all framework code lives in PerfSense.

### Music Blocks repo (config + workflows + one instrumentation hook; no app logic)

```
musicblocks/
├── perfsense.config.json          # pages (6), scenarios per page, runs=5, metrics,
│                                  #   thresholds
├── baseline.json                  # approved CI baseline (Section 3), committed & diffable
├── perfsense-server.cjs           # static benchmark server (serves repo on port 8787)
├── .github/workflows/perfsense.yml
│                                  # PR job: serve → 6 fixtures × 5 runs →
│                                  #   check vs baseline.json → post comment (never fail)
├── .github/workflows/perfsense-baseline.yml
│                                  # weekly + manual re-baseline on master →
│                                  #   open "chore: refresh perf baseline" review PR
└── js/activity.js                 # PerfSense bridge only: window.__mb hooks +
                                   #   exportMIDI timing bridge (instrumentation, no
                                   #   change to app behavior)
```

```jsonc
// perfsense.config.json (actual shape, 2026-09)
{
  "pages": [
    "http://127.0.0.1:8787/index.html?mbPerf=1",
    "http://127.0.0.1:8787/index.html?mbPerf=1&perfsenseProject=RainbowConnection.html",
    ...
  ],
  "runs": 5,
  "runTimeoutMs": 300000,
  "scenarios": {
    "index.html": ["bootstrap"],
    "RainbowConnection.html": ["openProject", "saveExport"],
    "Frere-Jacques.html": ["openProject", "playToCompletion"],
    ...
  },
  "fixtures": {
    "RainbowConnection.html": "examples/RainbowConnection.html",
    ...
  },
  "metrics": [
    "bootstrapTotal", "initTotal", "heapAfterBoot", "projectLoadTime",
    "saveTime", "exportMIDITime", "saveAsLilypondTime", "callbackLatencyMean",
    "callbackLatencyMax", "cumulativeDrift", "voiceOnsetError", "executionTime",
    "maxQueueDepth", "maxLogicalDepth", "blocksExecuted", "maxDepth",
    "scheduleCount", "memoryDelta", "retainedHeap"
  ],
  "thresholds": {
    "projectLoadTime": { "warning": 10, "fail": 25 },
    "maxDepth": { "warning": 10, "fail": 10000, "maxStatus": "warning" },
    "maxLogicalDepth": { "warning": 25, "fail": 50 },
    ...
  }
}
```

The PR trigger is a **plain pathspec filter** in `perfsense.yml` (`js css dist
index.html`, excluding `js/**/__tests__/**` and `js/**/*.test.js`) — no label
wiring, per scope decision.

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

- **Default = run; skip only provably inert classes** (docs, `js/**/__tests__/**`,
  `*.test.js`, `locales/`, sounds, images, `.github/` — everything outside the
  `js css dist index.html` pathspec plus the explicit test-file exclusions).
- Rationale: Music Blocks boots via RequireJS, which executes essentially every module
  in `js/` before the first Bootstrap measurement completes. So any file that ships and
  executes sits on a **measured path by construction** — almost any code change can
  plausibly affect a metric.
- This makes the filter **fail-safe**: a brand-new runtime file is covered by default
  and cannot silently bypass PerfSense. No hand-maintained allowlist to rot.
- **No label handling** (deliberate, per scope decision): no `perf:`/`skip-perf`
  overrides exist. The trigger is purely the pathspec above.
  Changes to benchmark fixtures themselves trip the hash check and invalidate the
  comparison (never benchmarked against a stale baseline).
- Trade-off explicitly accepted: occasional extra CI runs (false positives, ~4–6 min,
  comment-only) are cheap compared to a missed regression that ships and is only found
  by manual bisect weeks later.

---

## 6. Fork Validation Plan (before upstream)

Initial plumbing validation (4 mock PRs on the fork, all closed unmerged,
`ssz2605/musicblocks`, 2026-08-30) proved the pipeline mechanics — **but against the
pre-correction baseline and probes**. After the probe-correction commit (real
`turtleList` resolution, `maxActionDepth` probe, `exportMIDI` timing bridge), the
full 9-scenario matrix below is re-run one PR at a time against the corrected
baseline:

| # | Mock PR | Change | Expected Result | Status |
| - | ------- | ------ | --------------- | ------ |
| A | Docs-only | Root `.md` / `README.md` | PerfSense skipped, no comment | re-validate on corrected baseline |
| B | Neutral JS | Comment-only change in a runtime `js/` file | Runs, green, zero `:x:` flags | re-validate (was PR #15) |
| C | Loading regression | 4 s main-thread stall in `loadNewBlocks` (`js/blocks.js`) | `projectLoadTime` flagged `:x:` | re-validate (was PR #16, +54.4%) |
| D | Queue-ladder | Change that lifts per-turtle `queue.length` | `maxQueueDepth` responds | new |
| E | Recursion | Change that lifts `queue + parentFlowQueue` depth | `maxLogicalDepth` responds | new |
| F | Export delay | Added delay in MIDI export path | `exportMIDITime` responds | new |
| G | Hot-path touch | Comment/hot-path-only change in `js/logo.js` | Runs, green; advisory note (optional polish) | re-validate (was PR #17, green) |
| H | Identical repeat | Re-apply scenario B change verbatim | Green again, no threshold noise (stability) | new |
| I | Test-only | Change under `js/__tests__/` or `*.test.js` | Skipped, no comment (new pathspec exclusion) | new |

> Old mock PRs #14-#17 were locally pre-verified before their CI runs: 4 s stall →
> single-fixture median +70% vs baseline (runs=5, p=0.009). The earlier candidate
> injection point (disabling the `_suppressRefresh` guard) was rejected because it
> made `projectLoadTime` *faster* (4978 ms) — the guard is not actually exercised
> during measured project load.

Flow per run:

```
PR → GitHub Actions → static serve → Music Blocks benchmark (6 fixtures × 5 runs)
→ probe/metric collection → PerfSense-AI statistical comparison vs baseline.json
→ PR comment (table + evidence)
```

If all nine scenarios behave as expected, the same setup is ready for upstream.

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
| **Warn-only (config sets `maxStatus: warning`)** | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError`, `heapAfterBoot` | Audio metrics await the Layer C real-clock spike (headless synthetic clock means current drift/latency values are environment noise); `heapAfterBoot` stays warn-only as a boot-time smoke signal |
| **Core (protected from day one)** | `bootstrapTotal`, `initTotal`, `projectLoadTime`, `saveTime`, `exportMIDITime`, `maxQueueDepth`, `executionTime` (musical-tree, ascending-spiral), `blocksExecuted`, `scheduleCount` | Stable, reproducible, sensitive to hot-path changes; `scheduleCount` doubles as the live seam-health signal behind the Layer A tripwire |
| **Memory (verified after GC fix)** | `memoryDelta`, `retainedHeap` | Real since Chromium launches with `--expose-gc` and reads are GC-forced; still sensitive to CI noise, watch the 15% thresholds |
| **Sanity / unverified** | `maxDepth` | Tracks only synchronous JS call nesting, not program recursion — see §2 Notes; tracked but not gated |

**Warn-only until reviewed:** all audio-derived metrics — headless CI runs on a
synthesized audio clock, so their values cannot speak for real playback. The Layer C
spike (`perfsense-layerc-spike.yml`) measures the transport seam on a real
PulseAudio clock; if the spike shows stable real-clock variance, the audio metrics
are promoted to verified and gated.

**Do NOT baseline:** raw `executionTime` on song-length pieces (Rainbow Connection,
Frère Jacques) — it includes note waits and measures tempo, not interpreter CPU.
Wall-clock audio drift/playback latency — headless fake-audio is environment noise,
replaced by the deterministic Transport-clock metrics (`callbackLatency*`,
`cumulativeDrift`). TTFB/FCP/LCP — Lighthouse CI already owns these. Absolute heap
bytes — GC-noisy; keep deltas.

**Seam tripwire (Layer A):** `scheduleCount` is a verified count on Frère Jacques.
The CLI `check` command treats a dead Tone.Transport seam (zero scheduled events
and zero audio observations) as a hard failure — exit code 1 with a reason — rather
than silently reporting "no data" as a successful run. This is a precondition, not a
statistical rule; no approved metric's status is changed by it.

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
- Framework (CLI, driver, statistics, evidence, correlation, reporting) already
  implemented in PerfSense-AI.
- **Probe corrections merged on the fork (2026-09-12, commit `d1ad94b`):** real
  `turtleList` resolution fixes `maxQueueDepth` (was stuck at 0 on real runs); new
  `maxActionDepth` probe (per-turtle queue + parentFlowQueue depth); `exportMIDI`
  timing bridge so `exportMIDITime` measures the real export boundary; Phase-1
  sample-denominator fix; `PERFSENSE_REF` pinned to PerfSense-AI `e3fe235`
  (driver corrections: bridge-gated fixture drop, post-drop verification,
  playback proof, headless autoplay, `maxQ` reset).
- Baseline re-captured on the corrected runner (6 fixtures × 5 runs, ubuntu + pinned
  Chrome) — run 34703500794 — but that capture is **invalid for play/load metrics**:
  fixtures never opened (the file was dropped ~0.4 s in, before the `#myOpenFile`
  change handler exists at `activity.init.end`), so playback never started
  (executionTime ≈ the 4 s grace timeout on every page, `blocksExecuted = 15`,
  `cumulativeDrift = 0`). The baseline refresh PR therefore stays unmerged; the
  driver corrections below close the seams and the baseline is re-captured after
  they land.
- **Driver correction round (2026-09-12):** PerfSense-AI's ready-gate now waits for
  the real bridge (`mb.ui && mb.blocks`) on app pages before dropping the fixture
  (the `booted` escape is kept only for static mocks); post-drop verification
  requires `perfMarks.openStart` (hard-fails instead of reporting a phantom load);
  playback is proven via `isRunning()` within 20 s (null sample otherwise, instead
  of silently eating the grace timeout); `chromium.launch` passes
  `--autoplay-policy=no-user-gesture-required` so Tone.js scheduling fires headless;
  `maxQ` resets between the warm-up and measured runs; benchmark job timeout raised
  to 60 min to fit real playbacks (musical-tree ≈ 22.5 s, crabcanon ≈ 48 s).
- **Re-validation in progress:** the full 9-scenario mock matrix (A–I, §6) is run one
  PR at a time against the corrected baseline. Each scenario must behave as documented
  before the next is opened; nothing ships upstream until all nine pass.
- Known gaps to polish later (non-blocking): hot-path advisory note for hot-path-only
  changes (scenario G).
- **Baseline accuracy pass (2026-09):** three previously truthless metric families were
  made real and promoted — (1) **recursion**: `maxLogicalDepth` (exact per-executed-block
  `queue + parentFlowQueue` depth; musical-tree ≈254, ascending ≈28) is a verified metric,
  superseding the JS-nesting-only `maxDepth` trace; (2) **memory**: `memoryDelta` /
  `retainedHeap` are verified after GC-forced reads (Chrome `--expose-gc` +
  `window.gc()` before each heap read — headless unforced reads were stale zeros);
  (3) **audio** stays warn-only pending the Layer C real-clock spike, with a new verified
  `scheduleCount` and a Layer A seam tripwire in `check` (dead Tone.Transport seam ⇒
  hard exit, never silent "no data"). PerfSense pinned to `53ae5d2`. Baseline refresh
  after the spike review populates `baseline.json` with the promoted metrics.
- Next step (gated on A–I passing): offer upstream to `sugarlabs/musicblocks`
  (LICENSE/AGPL headers first, then a PR carrying the repo split from Section 4).
