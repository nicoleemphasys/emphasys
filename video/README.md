# Emphasys · NAHRO 2026 booth loop

75 s silent loop, 1920×1080, 30 fps, 2250 frames, built with [Motion Canvas](https://motioncanvas.io).

**Phase 1 (this commit): rough cut with footage placeholders.** Preview: `renders/preview.mp4` (960×540),
loop-seam check: `renders/preview-loopcheck.mp4` (frames 2190–2249 → 0–239),
style frame vs render: `renders/compare/compare-{1,2,3}.jpg`.

## Run

```sh
npm install
npm start                       # Motion Canvas editor (URL printed by Vite)
npm run render -- --scale 0.5 --name preview        # headless → output/preview/*.jpeg
CRF=24 scripts/encode.sh preview                     # → renders/preview.mp4 (+ loop check)
# Final: npm run render -- --scale 1 --name final --type png && scripts/encode.sh final   (CRF 18)
scripts/frames.sh 150 930                            # single frames → output/check/
```

Chromium is found at `/opt/pw-browsers/chromium`; override with `CHROMIUM_PATH`.

## Layout

- `src/config.ts`: all scene timing, copy, colors, footage file names (one place).
- `src/components/TextLine.tsx`: the guide's text moves: rise & unblur, kinetic stack, type-on, mask wipe,
  outline to fill, gradient sweep. `Slam.tsx`: scale slam. Counter roll lives in `scenes/s08.tsx`.
- `src/components/Scenery.tsx`: background + orbs, vignette, footage placeholder, roofline, vessel tag, glass, checks.
- `src/components/Opening.tsx`: the loop seam. Scene 1 and the end of Scene 9 draw the same shot from the
  same clock (T = frames from frame 0), so frame 2249 → frame 0 is one continuous motion.
- `src/scenes/s01…s09.tsx`: one file per scene; every property is a function of the scene frame `t`.

## Notes / deviations from the brief

- Grain (~14%) is added at encode time (ffmpeg `noise`); vignette is in every scene.
- Logo uses a reversed version (navy letters → white) so it reads on navy: `src/assets/logo-reversed.png`.
- Scene 5: "Faster answers / for families." finishes wiping by frame 1138 instead of mid-wipe at 1170, so
  each line stays fully visible ≥ 60 frames before the scene ends.
- Small UI text (vessel tags 36px, "Submitted" card 44/32px, timeline years 30px, placeholder labels)
  follows the style frames and is under the 60px rule; checklist and booth line were raised to 60px.
- Footage: none yet. Phase 2 swaps each placeholder for `public/footage/<name>.mp4` with a navy duotone.
