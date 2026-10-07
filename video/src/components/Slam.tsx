import {Node, blur} from '@motion-canvas/2d';
import {easeInCubic, easeOutCubic} from '@motion-canvas/core';
import {COLORS} from '../config';
import {X, Y, keyGradient, lerp, linear, measure, prog, rand} from '../lib';
import {Word} from './Word';

/**
 * Scale slam: 160% → 96% → 100% in 8f, then a 6px decaying shake.
 * Faint oversized echoes trail the landing.
 */
export function Slam(p: {
  t: () => number;
  text: string;
  size: number;
  cx: number; // board px, pivot
  cy: number;
  baseline: number;
  at: number;
  paint?: 'key' | 'sky' | 'white';
  out?: [number, number];
  echoes?: boolean;
  /** Starting scale (guide: 160%). */
  from?: number;
}) {
  const t = p.t;
  const w = measure(p.text, p.size);
  const fill = () => {
    if (p.paint === 'sky') return linear(0, 0, w, 0, ['#7EC4FF', '#CFE8FF']);
    if (p.paint === 'white') return COLORS.white;
    return keyGradient(0, w);
  };
  const scale = () => {
    const f = t() - p.at;
    const s0 = p.from ?? 1.6;
    if (f < 0) return s0;
    if (f < 5) return lerp(s0, 0.96, easeInCubic(f / 5));
    return lerp(0.96, 1, easeOutCubic(Math.min(1, (f - 5) / 3)));
  };
  const shake = (axis: number) => () => {
    const f = t() - p.at - 6;
    if (f < 0 || f > 14) return 0;
    return 6 * (1 - f / 14) * rand(Math.floor(t()) * 2 + axis);
  };
  const out = () => (p.out ? 1 - prog(t(), p.out[0], p.out[1]) : 1);
  const root = new Node({
    x: () => X(p.cx) + shake(0)(),
    y: () => Y(p.cy) + shake(1)(),
    opacity: () => out() * Math.min(1, Math.max(0, (t() - p.at + 1) / 2)),
  });
  const glyph = (s: () => number, a: () => number, b: number) => {
    const n = new Node({scale: s, opacity: a, filters: b ? [blur(b)] : []});
    n.add(
      new Word({
        content: p.text,
        size: p.size,
        x: -w / 2,
        y: p.baseline - p.cy,
        fill,
        shadowColor: p.paint === 'sky' ? 'rgba(67,167,249,0.6)' : 'rgba(247,107,19,0.55)',
        shadowBlur: b ? 0 : 40,
      }),
    );
    return n;
  };
  if (p.echoes !== false) {
    // Echo copies hang on after the hit, then dissolve.
    const echoA = () => (t() < p.at ? 0 : 1 - prog(t(), p.at + 20, p.at + 56));
    root.add(glyph(() => scale() * 1.2, () => 0.24 * echoA(), 8));
    root.add(glyph(() => scale() * 1.42, () => 0.14 * echoA(), 14));
  }
  root.add(glyph(scale, () => 1, 0));
  return root;
}
