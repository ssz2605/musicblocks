# PerfSense Validation Notes

This document records how the PerfSense regression metrics are validated
against real Music Blocks behavior. It is documentation only — this file sits
outside the runtime pathspec (`js`, `css`, `dist`, `index.html`), so changes
that touch only this file never trigger a PerfSense benchmark run.

## Validation matrix

Each entry is a mock PR, opened one at a time on the ssz2605 fork, checked
against the authoritative baseline captured from `master`, then closed before
the next one opens.

| PR | Change                         | Expected PerfSense verdict |
|----|--------------------------------|----------------------------|
| A  | docs-only                      | skipped (no benchmark)     |
| B  | neutral code change            | benchmark runs, no flag    |
| C  | load stall                     | flag `projectLoadTime`     |
| D  | queue ladder                   | flag `maxQueueDepth`       |
| E  | recursion                      | flag `maxActionDepth`      |
| F  | export delay                   | flag `exportMIDITime`      |
| G  | hot-path regression            | flag exec/latency metrics  |
| H  | identical repeat               | no flag (noise gate)       |
| I  | test-only change               | skipped (benchmark)        |

## Ground truth

The authoritative reference is Shreya's published GSoC measurements. Key
classes: musical-tree executes in the ~20–24 s range with ~1,130
`runFromBlockNow` calls; crabcanon ~48–50 s; Frere-Jacques is a long multi-voice
piece (~60 s here); Rainbow Connection loads in the ~9 s class after `#7923`
and exports MIDI in the ~1.5–1.7 s class after `#7970`; index boot is ~5.4 s.

Audio-clock metrics (`callbackLatencyMean`, `voiceOnsetError`,
`cumulativeDrift`) and memory deltas are warn-only and never gated: headless CI
Chromium has no live audio clock and does not refresh `performance.memory`
without GC, so those values describe the CI environment, not the browser
workload.