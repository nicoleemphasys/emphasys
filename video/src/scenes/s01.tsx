// Scene 1 · The keys (frames 0–180)
import {makeScene2D} from '@motion-canvas/2d';
import {Vector2, easeInOutCubic} from '@motion-canvas/core';
import {COPY} from '../config';
import {prog} from '../lib';
import {clock} from '../scene';
import {OpeningShot} from '../components/Opening';
import {OrbNode, Roofline, Vignette} from '../components/Scenery';
import {TextLine} from '../components/TextLine';

export default makeScene2D(function* (view) {
  const {t, run} = clock('s01');
  const [l1, l2, l3a, l3b] = COPY.s01;

  view.add(OpeningShot(t));
  // Warm light leak builds bottom-left as "home." lands.
  view.add(OrbNode({x: 120, y: 980, r: 520, color: '#F76B13', opacity: () => 0.35 * prog(t(), 100, 160)}));

  // Line 1 lands low, then the stack lifts as lines 2–3 arrive.
  const lift = () => 310 * (1 - prog(t(), 70, 92, easeInOutCubic));
  const out: [number, number] = [170, 180];
  view.add(TextLine({t, text: l1, x: 140, baseline: 362, size: 132, anim: {kind: 'rise', at: 50}, dy: lift, out}));
  view.add(TextLine({t, text: l2, x: 140, baseline: 497, size: 132, anim: {kind: 'rise', at: 82}, out}));
  view.add(
    TextLine({
      t,
      text: `${l3a} ${l3b}`,
      x: 140,
      baseline: 752,
      size: 132,
      keyFrom: 2,
      sweepAt: 142,
      anim: {kind: 'rise', at: 98},
      out,
    }),
  );
  // Roofline draws itself over "home." (20f).
  view.add(
    Roofline({
      points: () => [new Vector2(415, 634), new Vector2(586, 576), new Vector2(758, 634)],
      end: () => prog(t(), 112, 132, easeInOutCubic),
      opacity: () => 1 - prog(t(), out[0], out[1]),
      width: 9,
    }),
  );

  view.add(Vignette());
  yield* run();
});
