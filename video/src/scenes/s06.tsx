// Scene 6 · Stronger staff support (frames 1200–1440)
import {makeScene2D} from '@motion-canvas/2d';
import {easeInOutCubic} from '@motion-canvas/core';
import {COPY, FOOTAGE, HEIGHT, WIDTH} from '../config';
import {lerp, prog} from '../lib';
import {clock} from '../scene';
import {Background, OrbNode, Placeholder, Vignette, VesselTag, drift} from '../components/Scenery';
import {TextLine} from '../components/TextLine';

export default makeScene2D(function* (view) {
  const {t, run} = clock('s06');
  const [l1, l2, l3a, l3b] = COPY.s06;

  const huddle = () => 1 - prog(t(), 40, 58);
  view.add(
    Background({
      orbs: [
        {x: 1600, y: drift(t, 650, 30, 220), r: 680, color: '#3A8EE0', opacity: 0.7},
        {x: 380, y: 260, r: 520, color: '#2F86E0', opacity: () => 0.4 * (1 - huddle())},
      ],
    }),
  );
  // Warm light leak over the huddle footage, then a softer one later.
  view.add(OrbNode({x: 320, y: 480, r: 900, color: '#F76B13', opacity: () => huddle()}));
  view.add(OrbNode({x: 1150, y: 820, r: 560, color: '#F76B13', opacity: () => 0.4 * prog(t(), 150, 200)}));

  view.add(
    Placeholder({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      file: FOOTAGE.s06Huddle.file,
      note: FOOTAGE.s06Huddle.note,
      border: false,
      opacity: () => 0.55 * huddle(),
      scale: () => 1.03 + 0.05 * prog(t(), 0, 58),
    }),
  );

  // Right-half footage that settles into a framed card.
  const toCard = () => prog(t(), 140, 162, easeInOutCubic);
  // Two stacked placeholders crossfade so the label swaps mid-move.
  const frame = {
    x: () => lerp(1040, 1342, toCard()),
    y: () => lerp(0, 182, toCard()),
    w: () => lerp(880, 436, toCard()),
    h: () => lerp(HEIGHT, 556, toCard()),
    radius: 24,
    labelSolid: true,
  };
  const shown = () => prog(t(), 40, 56);
  view.add(
    Placeholder({...frame, file: FOOTAGE.s06Laughing.file, note: FOOTAGE.s06Laughing.note, opacity: () => shown() * (1 - toCard())}),
  );
  view.add(
    Placeholder({...frame, file: FOOTAGE.s06SupportTeam.file, note: FOOTAGE.s06SupportTeam.note, opacity: () => shown() * toCard()}),
  );

  // Type-on, three lines; the stack lifts when the third line starts.
  const lift = () => 89 * (1 - prog(t(), 104, 120, easeInOutCubic));
  view.add(TextLine({t, text: l1, x: 140, baseline: 452, size: 135, dy: lift, anim: {kind: 'type', at: 62, cursor: [58, 82]}}));
  view.add(TextLine({t, text: l2, x: 140, baseline: 585, size: 135, dy: lift, anim: {kind: 'type', at: 82, cursor: [82, 106]}}));
  view.add(
    TextLine({
      t,
      text: `${l3a} ${l3b}`,
      x: 140,
      baseline: 715,
      size: 135,
      keyFrom: 1,
      sweepAt: 200,
      anim: {kind: 'type', at: 106, cursor: [106, 168]},
    }),
  );

  view.add(VesselTag({index: 3}));
  view.add(Vignette());
  yield* run();
});
