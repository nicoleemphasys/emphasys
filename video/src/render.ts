// Headless render entry: opened by scripts/render.mjs in Chromium.
// Query: ?from=<frame>&to=<frame>&scale=<0..1>&name=<dir>&type=png|jpeg
import project from './project?project';
import {Renderer, Vector2} from '@motion-canvas/core';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './config';

const q = new URLSearchParams(location.search);
const from = Number(q.get('from') ?? 0);
const to = Number(q.get('to') ?? TOTAL_FRAMES - 1);
const w = window as any;
w.renderState = {done: false, frame: 0, error: null};

try {
  const renderer = new Renderer(project);
  renderer.onFrameChanged.subscribe(f => (w.renderState.frame = f));
  await renderer.render({
    name: q.get('name') ?? 'preview',
    // Bias by a quarter frame so seconds→frames rounding lands on exact frames.
    range: [Math.max(0, from - 0.25) / FPS, (to - 0.25) / FPS],
    fps: FPS,
    size: new Vector2(WIDTH, HEIGHT),
    resolutionScale: Number(q.get('scale') ?? 0.5),
    colorSpace: 'srgb',
    background: '#052E65',
    exporter: {
      name: '@motion-canvas/core/image-sequence',
      options: {fileType: `image/${q.get('type') ?? 'jpeg'}`, quality: 92, groupByScene: false},
    },
  });
} catch (e) {
  w.renderState.error = String((e as Error)?.stack ?? e);
}
w.renderState.done = true;
