// Scene 3 · Clearer workflows (frames 480–720)
import {Node, Rect, makeScene2D} from '@motion-canvas/2d';
import {easeInOutCubic, easeOutCubic} from '@motion-canvas/core';
import {COPY, FOOTAGE, HEIGHT, WIDTH} from '../config';
import {X, Y, lerp, prog} from '../lib';
import {clock} from '../scene';
import {Background, Placeholder, Vignette, VesselTag, drift} from '../components/Scenery';
import {TextLine} from '../components/TextLine';

// Scattered "paper" cards (center x, y, rotation°) → tidy column.
const SCATTER = [
  [1190, 310, -15],
  [1510, 235, 9],
  [1330, 530, 6],
  [1630, 625, -9],
  [1110, 765, 12],
  [1560, 905, -4],
];
const COLUMN_TOPS = [232, 422, 612, 802];

export default makeScene2D(function* (view) {
  const {t, run} = clock('s03');
  const c = COPY.s03;

  const warm = () => 0.9 * (1 - prog(t(), 20, 80));
  view.add(
    Background({
      orbs: [
        {x: 1620, y: drift(t, 600, 30, 240), r: 680, color: '#2F86E0', opacity: 0.8},
        {x: 330, y: 430, r: 620, color: '#F76B13', opacity: warm},
        {x: 380, y: 820, r: 480, color: '#2A5FB0', opacity: 0.35},
      ],
    }),
  );

  // Paper-stack footage, entering out of focus from the "You." beat.
  const unblur = () => 26 * (1 - prog(t(), 0, 30));
  view.add(
    Placeholder({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      file: FOOTAGE.s03PaperStack.file,
      note: FOOTAGE.s03PaperStack.note,
      border: false,
      blur: unblur,
      opacity: () => 0.6 * (1 - prog(t(), 40, 62)),
      scale: () => 1.04 + 0.04 * prog(t(), 0, 60),
    }),
  );

  // Cards fan out of the stack, then snap into a clean column.
  const fan = (i: number) => prog(t(), 44 + i * 4, 84 + i * 4, easeOutCubic);
  const align = (i: number) => prog(t(), 112 + i * 3, 134 + i * 3, easeInOutCubic);
  SCATTER.forEach(([sx, sy, sr], i) => {
    const col = i < 4;
    const tx = 1520;
    const ty = col ? COLUMN_TOPS[i] + 64 : sy;
    const bob = () => 8 * Math.sin((t() + i * 17) / 22);
    const card = new Node({
      x: () => X(lerp(lerp(1360, sx, fan(i)), tx, col ? align(i) : 0)),
      y: () => Y(lerp(lerp(600, sy, fan(i)), ty, col ? align(i) : 0) + bob() * (1 - (col ? align(i) : 0))),
      rotation: () => lerp(lerp(-3 + i, sr, fan(i)), 0, col ? align(i) : 0),
      opacity: () => Math.min(prog(t(), 44 + i * 4, 52 + i * 4), col ? 1 : 1 - prog(t(), 108, 124)),
    });
    const w = () => lerp(420, 516, col ? align(i) : 0);
    const h = () => lerp(140, 128, col ? align(i) : 0);
    card.add(
      new Rect({
        width: w,
        height: h,
        radius: 22,
        fill: 'rgba(255,255,255,0.12)',
        stroke: 'rgba(255,255,255,0.24)',
        lineWidth: 1.5,
      }),
    );
    const bar = (yy: number, bw: number, bh: number, color: string) =>
      new Rect({
        offset: [-1, 0],
        x: () => -w() / 2 + 30,
        y: () => -h() / 2 + yy,
        width: () => bw * (w() / 420),
        height: bh,
        radius: bh / 2,
        fill: color,
      });
    card.add(bar(38, 210, 16, 'rgba(255,255,255,0.82)'));
    card.add(bar(68, 300, 10, 'rgba(255,255,255,0.32)'));
    card.add(bar(92, 160, 10, 'rgba(67,167,249,0.85)'));
    view.add(card);
  });

  view.add(VesselTag({index: 0, blur: unblur, opacity: () => prog(t(), 0, 10)}));

  view.add(TextLine({t, text: c[0], x: 140, baseline: 465, size: 130, anim: {kind: 'kinetic', at: 148, from: -1}}));
  view.add(TextLine({t, text: c[1], x: 140, baseline: 600, size: 130, anim: {kind: 'kinetic', at: 162, from: 1}}));
  view.add(
    TextLine({t, text: c[2], x: 140, baseline: 725, size: 130, paint: 'key', sweepAt: 204, anim: {kind: 'kinetic', at: 176, from: -1}}),
  );

  view.add(Vignette());
  yield* run();
});
