// Scene 4 · Compliance confidence (frames 720–960)
import {Circle, Line, Node, makeScene2D} from '@motion-canvas/2d';
import {Vector2, easeInOutCubic, easeOutCubic} from '@motion-canvas/core';
import {COLORS, COPY, FOOTAGE, HEIGHT, WIDTH} from '../config';
import {P, X, Y, backOut, prog} from '../lib';
import {clock} from '../scene';
import {Background, CheckBadge, Glass, Placeholder, Vignette, VesselTag, drift} from '../components/Scenery';
import {TextLine} from '../components/TextLine';
import {Word} from '../components/Word';

export default makeScene2D(function* (view) {
  const {t, run} = clock('s04');
  const c = COPY.s04;

  const warm = () => 0.6 * prog(t(), 150, 190);
  view.add(
    Background({
      orbs: [
        {x: drift(t, 1520, 40, 260), y: 260, r: 640, color: '#2F86E0', opacity: () => 0.75 - 0.3 * warm()},
        {x: 1500, y: 640, r: 520, color: '#F76B13', opacity: warm},
        {x: 400, y: 800, r: 520, color: '#2A5FB0', opacity: 0.35},
      ],
    }),
  );

  // A · Inspector footage with a focus reticle.
  view.add(
    Placeholder({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      file: FOOTAGE.s04Detector.file,
      note: FOOTAGE.s04Detector.note,
      border: false,
      opacity: () => 0.75 * (1 - prog(t(), 72, 86)),
      scale: () => 1.03 + 0.05 * prog(t(), 0, 86),
    }),
  );
  const reticle = new Node({
    x: X(960),
    y: Y(520),
    scale: () => 1.25 - 0.25 * prog(t(), 6, 20, backOut(0.04)) + 0.012 * Math.sin(t() / 5),
    opacity: () => prog(t(), 6, 14) * (1 - prog(t(), 66, 78)),
  });
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    reticle.add(
      new Line({
        points: [new Vector2(sx * 300, sy * 190), new Vector2(sx * 300, sy * 260), new Vector2(sx * 230, sy * 260)],
        stroke: COLORS.sky,
        lineWidth: 6,
        shadowColor: COLORS.sky,
        shadowBlur: 14,
      }),
    );
  }
  view.add(reticle);

  // B · Tablet + checklist.
  const splitOut = () => prog(t(), 136, 150, easeInOutCubic);
  view.add(
    Placeholder({
      x: 0,
      y: 0,
      w: 900,
      h: HEIGHT,
      file: FOOTAGE.s04Tablet.file,
      note: FOOTAGE.s04Tablet.note,
      opacity: () => 0.8 * prog(t(), 70, 84) * (1 - splitOut()),
    }),
  );
  const panelIn = () => prog(t(), 72, 88, easeOutCubic);
  const panel = new Node({
    x: () => 400 * (1 - panelIn()) + 300 * splitOut(),
    opacity: () => panelIn() * (1 - splitOut()),
  });
  panel.add(Glass({x: 880, y: 300, w: 900, h: 435, radius: 32}));
  for (const sy of [455, 580]) {
    panel.add(new Line({points: [P(937, sy), P(1722, sy)], stroke: 'rgba(255,255,255,0.16)', lineWidth: 1.5}));
  }
  const checks = [82, 92, 122];
  c.checklist.forEach((item, i) => {
    const cy = 392 + i * 125;
    const at = checks[i];
    panel.add(CheckBadge({x: 968, y: cy, r: 32, pop: () => prog(t(), at, at + 8, backOut(0.12)), draw: () => prog(t(), at + 3, at + 10)}));
    if (i === 2) {
      // Spinner while the last item is still "working".
      panel.add(
        new Circle({
          x: X(968),
          y: Y(cy),
          size: 60,
          stroke: COLORS.sky,
          lineWidth: 4,
          lineCap: 'round',
          startAngle: () => t() * 14,
          endAngle: () => t() * 14 + 150,
          opacity: () => prog(t(), 88, 92) * (1 - prog(t(), at - 2, at + 2)),
        }),
      );
    }
    panel.add(new Word({content: item, size: 60, weight: 500, x: X(1033), y: Y(cy + 21), fill: COLORS.white}));
  });
  view.add(panel);

  // C · Headline + drawn check.
  view.add(TextLine({t, text: c.headline[0], x: 140, baseline: 500, size: 142, anim: {kind: 'rise', at: 150}}));
  view.add(
    TextLine({
      t,
      text: `${c.headline[1]} ${c.headline[2]}`,
      x: 140,
      baseline: 643,
      size: 142,
      keyFrom: 1,
      outline: {from: 1, fillAt: 199},
      anim: {kind: 'rise', at: 162},
    }),
  );
  view.add(
    new Line({
      points: [P(1472, 490), P(1560, 578), P(1690, 412)],
      stroke: COLORS.orange,
      lineWidth: 22,
      lineCap: 'round',
      lineJoin: 'round',
      shadowColor: 'rgba(247,107,19,0.9)',
      shadowBlur: 26,
      end: () => prog(t(), 170, 188, easeInOutCubic),
      opacity: () => (t() > 170 ? 1 : 0),
    }),
  );

  view.add(VesselTag({index: 1}));
  view.add(Vignette());
  yield* run();
});
