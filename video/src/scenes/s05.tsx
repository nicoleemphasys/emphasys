// Scene 5 · Better resident experiences (frames 960–1200)
import {Circle, Node, Rect, makeScene2D} from '@motion-canvas/2d';
import {easeOutCubic} from '@motion-canvas/core';
import {COLORS, COPY, FOOTAGE, HEIGHT, WIDTH} from '../config';
import {X, Y, backOut, prog} from '../lib';
import {clock} from '../scene';
import {Background, CheckBadge, OrbNode, Placeholder, Vignette, VesselTag, drift} from '../components/Scenery';
import {TextLine} from '../components/TextLine';
import {Word} from '../components/Word';

export default makeScene2D(function* (view) {
  const {t, run} = clock('s05');
  const c = COPY.s05;

  view.add(
    Background({
      orbs: [
        {x: drift(t, 1560, 40, 260), y: 520, r: 700, color: '#2F86E0', opacity: 0.75},
        {x: 400, y: 820, r: 520, color: '#2A5FB0', opacity: 0.35},
      ],
    }),
  );

  view.add(
    Placeholder({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      file: FOOTAGE.s05KitchenPhone.file,
      note: FOOTAGE.s05KitchenPhone.note,
      border: false,
      opacity: () => 0.75 * (1 - prog(t(), 50, 64)),
      scale: () => 1.03 + 0.05 * prog(t(), 0, 64),
    }),
  );

  // Phone + rings + "Submitted" card.
  const phoneIn = () => prog(t(), 52, 72, easeOutCubic);
  const phoneOut = () => prog(t(), 128, 144);
  const ui = new Node({opacity: () => phoneIn() * (1 - phoneOut()), y: () => 80 * (1 - phoneIn()) - 40 * phoneOut()});
  ui.add(OrbNode({x: 1360, y: 560, r: 560, color: '#3A9BF5', opacity: 0.7}));
  [330, 440, 560].forEach((r, i) => {
    ui.add(
      new Circle({
        x: X(1360),
        y: Y(560),
        size: () => 2 * (r + 14 * ((t() / 40 + i * 0.33) % 1)),
        stroke: COLORS.sky,
        lineWidth: 2,
        opacity: () => [0.45, 0.3, 0.18][i] * (1 - 0.6 * ((t() / 40 + i * 0.33) % 1)),
      }),
    );
  });
  ui.add(
    new Rect({
      x: X(1182 + 178),
      y: Y(202 + 358),
      width: 356,
      height: 716,
      radius: 48,
      fill: '#0A3270',
      stroke: '#5DB5FF',
      lineWidth: 4,
      shadowColor: 'rgba(67,167,249,0.9)',
      shadowBlur: 30,
    }),
  );
  const cardPop = () => prog(t(), 78, 90, backOut(0.06));
  const card = new Node({x: X(1360), y: () => Y(500) - 24 * (1 - cardPop()), scale: () => 0.92 + 0.08 * cardPop(), opacity: () => prog(t(), 78, 84)});
  card.add(new Rect({width: 706, height: 165, radius: 24, fill: 'rgba(120,170,230,0.42)', stroke: 'rgba(255,255,255,0.28)', lineWidth: 1.5}));
  ui.add(card);
  const badge = CheckBadge({x: 1082, y: 500, r: 37, pop: () => prog(t(), 84, 92, backOut(0.12)), draw: () => prog(t(), 88, 96)});
  ui.add(badge);
  ui.add(new Word({content: c.cardTitle, size: 44, x: X(1147), y: Y(494), fill: COLORS.white, opacity: () => prog(t(), 86, 92)}));
  ui.add(new Word({content: c.cardBody, size: 32, weight: 400, x: X(1147), y: Y(540), fill: 'rgba(255,255,255,0.9)', opacity: () => prog(t(), 90, 96)}));
  view.add(ui);

  view.add(
    Placeholder({
      x: 142,
      y: 622,
      w: 356,
      h: 356,
      circle: true,
      file: FOOTAGE.s05Mailbox.file,
      labelInset: [40, 30],
      opacity: () => prog(t(), 68, 80) * (1 - phoneOut()),
      labelSolid: true,
    }),
  );

  // Headline: rise, then two mask wipes.
  view.add(TextLine({t, text: c.headline[0], x: 140, baseline: 485, size: 128, anim: {kind: 'rise', at: 140}}));
  view.add(TextLine({t, text: c.headline[1], x: 140, baseline: 607, size: 128, anim: {kind: 'wipe', at: 156}}));
  view.add(TextLine({t, text: c.headline[2], x: 140, baseline: 729, size: 128, paint: 'key', anim: {kind: 'wipe', at: 172}}));
  view.add(
    Placeholder({
      x: 1382,
      y: 562,
      w: 396,
      h: 396,
      circle: true,
      file: FOOTAGE.s05Fridge.file,
      labelInset: [50, 30],
      labelSolid: true,
      opacity: () => prog(t(), 150, 164),
    }),
  );

  view.add(VesselTag({index: 2}));
  view.add(Vignette());
  yield* run();
});
