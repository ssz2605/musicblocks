# PerfSense: Performance Regression Detection for Music Blocks

Comment-only performance checks on PRs. Measures real Music Blocks behavior
(startup, project load, save/export, audio scheduling, execution, queue/memory
pressure) on every relevant PR and posts a comparison comment. Never fails a
check, never blocks a merge.

## 1. Benchmark Matrix

Six committed projects from `examples/`, each covering a different dimension:

| Project | Covers | Key metrics |
| ------- | ------ | ----------- |
| Empty | App startup | `bootstrapTotal`, `initTotal`, `heapAfterBoot` |
| Rainbow Connection (largest project) | Project load, save/export, memory | `projectLoadTime`, `saveTime`, `exportMIDITime`, `memoryDelta`, `retainedHeap` |
| Frère Jacques (4-voice round) | Tone.js transport scheduling | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError` |
| musical-tree (recursive drawing) | Recursive/action-heavy execution | `maxQueueDepth`, `maxActionDepth`, `executionTime`, `maxDepth`, `memoryDelta`, `retainedHeap` |
| ascending-notes-color-spiral (completes <1s) | Interpreter throughput | `executionTime`, `maxQueueDepth`, `maxActionDepth`, `maxDepth`, `blocksExecuted` |
| crabcanon-plot (2 staggered turtles) | Two-voice scheduling | `callbackLatencyMean`, `callbackLatencyMax`, `cumulativeDrift`, `voiceOnsetError` |

Notes:

- `maxActionDepth` (max per-turtle `queue.length + parentFlowQueue.length`) is the
  real recursion signal; musical-tree's recursive actions explode it while linear
  songs stay flat.
- `maxQueueDepth` (max per-turtle `queue.length`) tracks raw queue accumulation.
- `maxDepth` is sanity-tracked only (synchronous JS nesting, not program
  recursion).
- `blocksExecuted` sanity-checks `executionTime`: stable count + rising time is a
  genuine slowdown; a changing count means the workload changed.
- Rejected fixtures: projects with `forever` loops (never terminate) or that need
  clicks (`listen`/`myclick`), or that use audio-file media blocks.

Metric origins: `window.__mbPerf.measures` (`?mbPerf=1`), `performanceTracker.getStats()`
(`?performance=true`), real UI timing for open/save/export, and page-level injectors
wrapping the `synth.transport.schedule` seam, queue samplers, and CDP precise memory.

## 2. Baseline Contract

`baseline.json` stores the full sample distribution per page+metric (median, p10,
p90, raw values), plus runner identity, commit SHA, fixture hashes, and the
flagging rule. Comparisons are distribution-vs-distribution, not 1:1.

The baseline is generated on `main` by the same driver/environment as PR runs,
committed and diffable, and refreshed weekly through a reviewable PR opened by the
baseline workflow. Fixture hashes invalidate comparisons if an example file is
edited.

## 3. Repo Split

Music Blocks holds data/config only; all framework code lives in PerfSense-AI.

```
musicblocks/
├── perfsense.config.json          # pages, scenarios, runs, metrics, thresholds
├── baseline.json                  # approved CI baseline
├── perfsense-server.cjs           # static benchmark server
├── .github/workflows/perfsense.yml            # PR benchmark + comment
├── .github/workflows/perfsense-baseline.yml   # weekly baseline refresh PR
└── js/activity.js                 # PerfSense bridge: window.__mb hooks + exportMIDI timing
```

PR trigger is a plain pathspec filter in `perfsense.yml`
(`js css dist index.html`, excluding `js/**/__tests__/**` and `js/**/*.test.js`).

PerfSense-AI contains the CLI, Playwright driver (bootstrap/openProject/
playToCompletion/saveExport scenarios), statistics (Mann-Whitney U, Cliff's
delta), evidence collection, GitHub reporter, and optional AI. The integration
here is only the config + workflows + server above.

## 4. Trigger Strategy

Default is to run; skip only provably inert classes (docs, tests, locales,
sounds, images, `.github/`). Music Blocks boots via RequireJS, which executes
essentially every module in `js/` before the first measurement completes, so any
shipped code sits on a measured path by construction. The pathspec is fail-safe:
a new runtime file is covered by default. No labels or manual allowlists.

## 5. Statistics / Flagging Rule

A regression is flagged when all three hold on distributions of ≥ 5 valid runs
per fixture:

- Mann-Whitney U p < 0.05 (not sampling noise), and
- median change ≥ threshold (timing 10%, memory 15% defaults; audio/memory
  metrics are warn-only), and
- Cliff's δ ≥ 0.147 (at least a small effect).

Audio-derived and memory metrics are warn-only: headless CI cannot measure them
reliably, and PerfSense never blocks merges anyway.

## 6. Status

- Driver and probe corrections merged on the fork; PerfSense pinned by SHA
  (`PERFSENSE_REF`).
- Baseline re-captured with real playbacks on the corrected runner.
- Full mock-PR validation matrix (A–I: docs-skip, neutral, load regression,
  queue ladder, recursion, export delay, hot-path, identical repeat, test-only
  skip) is being run one PR at a time against the corrected baseline. Each
  scenario must behave as documented before the next is opened.
- After A–I passes, offer upstream to `sugarlabs/musicblocks`.