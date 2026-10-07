// Scene 8 · Fifty years (frames 1680–1890)
import {Line, Node, Rect, Txt, blur, makeScene2D} from '@motion-canvas/2d';
import {Vector2, easeInOutCubic, easeOutCubic, linear as linearEase} from '@motion-canvas/core';
import {COLORS, COPY, FONT} from '../config';
import {P, X, Y, linear, measure, prog} from '../lib';
import {clock} from '../scene';
import {Background, OrbNode, Roofline, Vignette} from '../components/Scenery';
import {Slam} from '../components/Slam';
import {TextLine} from '../components/TextLine';
import {Word} from '../components/Word';

const ROLL_END = 84; // counter roll 1976 → 2026
const DIGIT = 360;
const PITCH = 300;

export default makeScene2D(function* (view) {
  const {t, run} = clock('s08');
  const c = COPY.s08;

  const warm = () => prog(t(), 86, 104) * (1 - prog(t(), 112, 130));
  view.add(
    Background({
      orbs: [
        {x: 960, y: 470, r: 620, color: '#2F86E0', opacity: () => 0.75 * (1 - warm() * 0.5)},
        {x: 1580, y: 650, r: 520, color: '#2F86E0', opacity: 0.45},
      ],
    }),
  );
  view.add(OrbNode({x: 960, y: 560, r: 560, color: '#F76B13', opacity: () => 0.45 * warm()}));

  // Odometer: continuous year value, carries roll like a slot reel.
  const year = () => 1976 + 50 * prog(t(), 0, ROLL_END, linearEase);
  const colW = measure('0', DIGIT) * 1.04;
  const counterA = () => 1 - prog(t(), 86, 88);
  const counter = new Node({x: X(960), y: Y(592), opacity: counterA});
  for (let k = 0; k < 4; k++) {
    const pow = 10 ** (3 - k);
    const pos = () => {
      const y = year();
      const base = Math.floor(y);
      const frac = y - base;
      const lower = base % pow;
      const carry = pow === 1 || lower === pow - 1 ? frac : 0;
      return Math.floor(base / pow) + carry;
    };
    const col = new Node({x: (k - 1.5) * colW});
    for (const off of [-1, 0, 1, 2]) {
      const digit = () => (((Math.floor(pos()) + off) % 10) + 10) % 10;
      const dy = () => (off - (pos() - Math.floor(pos()))) * PITCH;
      const main = () => Math.abs(dy()) < PITCH / 2;
      col.add(
        new Word({
          content: () => String(digit()),
          size: DIGIT,
          x: () => -measure(String(digit()), DIGIT) / 2,
          y: dy,
          fill: COLORS.white,
          // Reel ghosts only on the fast-spinning tens/ones columns.
          opacity: () => (main() ? 1 : k >= 2 && Math.abs(dy()) < PITCH * 1.5 ? 0.13 : 0),
          filters: [blur(() => (main() ? 0 : 8))],
        }),
      );
    }
    counter.add(col);
  }
  view.add(counter);
  view.add(Slam({t, text: '2026', size: DIGIT, cx: 960, cy: 455, baseline: 592, at: 86, paint: 'sky', from: 1.18, out: [112, 122]}));

  // Timeline under the counter; it returns at the end to bend into the roof.
  const tlA = () => 1 - prog(t(), 112, 122);
  view.add(new Line({points: [P(240, 880), P(1680, 880)], stroke: 'rgba(255,255,255,0.25)', lineWidth: 2, opacity: tlA}));
  view.add(
    new Rect({
      offset: [-1, 0],
      x: X(240),
      y: Y(880),
      width: () => 1440 * prog(t(), 0, ROLL_END, easeOutCubic),
      height: 7,
      radius: 4,
      fill: () => linear(0, 0, 1440, 0, [COLORS.orange, COLORS.orangeLight]),
      shadowColor: 'rgba(247,107,19,0.9)',
      shadowBlur: 16,
      opacity: tlA,
    }),
  );
  const label = (text: string, x: number, a: () => number) =>
    new Txt({
      offset: [x > 960 ? 1 : -1, 0],
      x: X(x),
      y: Y(934),
      text,
      fontFamily: FONT.family,
      fontWeight: 500,
      fontSize: 30,
      fill: 'rgba(255,255,255,0.8)',
      opacity: a,
    });
  view.add(label('1976', 240, () => prog(t(), 0, 8) * tlA()));
  view.add(label('2026', 1670, () => prog(t(), ROLL_END, ROLL_END + 8) * tlA()));
  view.add(
    Roofline({
      points: () => [new Vector2(240, 880), new Vector2(960, 880), new Vector2(1680, 880)],
      end: () => prog(t(), 194, 208, easeInOutCubic),
      width: 8,
    }),
  );

  // Headline.
  const out: [number, number] = [194, 204];
  view.add(TextLine({t, text: c.range, x: 140, baseline: 300, size: 70, weight: 500, fill: COLORS.sky, anim: {kind: 'rise', at: 120}, out}));
  c.headline.forEach((text, i) =>
    view.add(
      TextLine({
        t,
        text,
        x: 140,
        baseline: 465 + i * 120,
        size: 122,
        paint: i === 2 ? 'key' : undefined,
        sweepAt: i === 2 ? 172 : undefined,
        anim: {kind: 'rise', at: 126 + i * 8},
        out,
      }),
    ),
  );

  view.add(Vignette());
  yield* run();
});
