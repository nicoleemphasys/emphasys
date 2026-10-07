// Scene 2 · The people behind it (frames 180–480)
import {makeScene2D} from '@motion-canvas/2d';
import {easeInOutCubic, easeOutCubic} from '@motion-canvas/core';
import {COPY, FOOTAGE} from '../config';
import {lerp, prog} from '../lib';
import {clock} from '../scene';
import {Background, OrbNode, Placeholder, Vignette, drift} from '../components/Scenery';
import {Slam} from '../components/Slam';
import {TextLine} from '../components/TextLine';

const CELLS = [
  {x: 10, y: 10},
  {x: 968, y: 10},
  {x: 10, y: 548},
  {x: 968, y: 548},
];
const CELL_W = 942;
const CELL_H = 522;

export default makeScene2D(function* (view) {
  const {t, run} = clock('s02');
  const c = COPY.s02;

  // Grid phase fades out, "You." phase darkens to a warm core.
  const gridOut = () => prog(t(), 212, 230, easeInOutCubic);
  view.add(
    Background({
      orbs: [
        {x: drift(t, 1480, 40, 200), y: 300, r: 640, color: '#2F86E0', opacity: () => 0.7 * (1 - gridOut())},
        {x: 300, y: 900, r: 520, color: '#2A5FB0', opacity: 0.35},
      ],
      dim: () => 0.55 * gridOut(),
    }),
  );
  view.add(OrbNode({x: 960, y: 520, r: 620, color: '#F76B13', opacity: () => 0.5 * gridOut()}));
  view.add(OrbNode({x: 1560, y: 800, r: 520, color: '#2F86E0', opacity: () => 0.5 * gridOut()}));

  // A · Intro: card enters right, two-line kinetic stack.
  const toGrid = () => prog(t(), 92, 110, easeInOutCubic);
  const cardIn = () => prog(t(), 0, 14, easeOutCubic);
  const cellFx = (i: number) => (i === 0 ? 0 : prog(t(), 96 + i * 12, 108 + i * 12, easeOutCubic));
  const files = Placeholder({
    x: () => lerp(1262 + 300 * (1 - cardIn()), CELLS[0].x, toGrid()),
    y: () => lerp(142, CELLS[0].y, toGrid()),
    w: () => lerp(516, CELL_W, toGrid()),
    h: () => lerp(796, CELL_H, toGrid()),
    radius: 24,
    file: FOOTAGE.s02Files.file,
    note: FOOTAGE.s02Files.note,
    noteOpacity: () => 1 - prog(t(), 80, 90),
    play: () => 1 - prog(t(), 88, 98),
    labelSolid: true,
    opacity: () => cardIn() * (1 - gridOut()),
  });
  const intro: [number, number] = [84, 96];
  view.add(TextLine({t, text: c.intro[0], x: 140, baseline: 460, size: 150, anim: {kind: 'kinetic', at: 2, from: 1}, out: intro}));
  view.add(
    TextLine({t, text: c.intro[1], x: 140, baseline: 612, size: 150, paint: 'sky', anim: {kind: 'kinetic', at: 10, from: -1}, out: intro}),
  );

  // B · 2×2 grid of the people.
  view.add(files);
  const clips = [FOOTAGE.s02Files, FOOTAGE.s02Inspector, FOOTAGE.s02Phone, FOOTAGE.s02LateOffice];
  CELLS.forEach((cell, i) => {
    if (i > 0) {
      view.add(
        Placeholder({
          x: cell.x,
          y: () => cell.y + 30 * (1 - cellFx(i)),
          w: CELL_W,
          h: CELL_H,
          radius: 18,
          file: clips[i].file,
          opacity: () => cellFx(i) * (1 - gridOut()),
        }),
      );
    }
    view.add(
      TextLine({
        t,
        text: c.roles[i],
        x: cell.x + 52,
        baseline: cell.y + 367,
        size: 100,
        anim: {kind: 'rise', at: 108 + i * 13},
        out: [212, 224],
      }),
    );
  });

  // C · "You." scale slam with echoes.
  view.add(Slam({t, text: c.you, size: 520, cx: 960, cy: 545, baseline: 727, at: 236}));

  view.add(Vignette());
  yield* run();
});
