import {Node, Rect, blur} from '@motion-canvas/2d';
import {easeOutCubic, linear as linearEase} from '@motion-canvas/core';
import {COLORS, FONT} from '../config';
import {X, Y, backOut, clamp01, keyGradient, linear, measure, prog} from '../lib';
import {Word} from './Word';

export type Anim =
  | {kind: 'rise'; at: number; stagger?: number; dur?: number}
  | {kind: 'kinetic'; at: number; from: 1 | -1; dur?: number}
  | {kind: 'type'; at: number; perChar?: number; cursor?: [number, number]}
  | {kind: 'wipe'; at: number; dur?: number}
  | {kind: 'static'};

export interface TextLineProps {
  t: () => number;
  text: string;
  x: number; // left edge, board px
  baseline: number; // baseline, board px
  size: number;
  weight?: number;
  fill?: string;
  /** Words from this index on use the key-phrase gradient (or `paint`). */
  keyFrom?: number;
  paint?: 'key' | 'sky';
  /** Frame at which the gradient band sweeps across the key phrase (16f). */
  sweepAt?: number;
  /** Words from `from` start as a 3px orange outline; fill wipes in at `fillAt` (12f). */
  outline?: {from: number; fillAt: number};
  anim: Anim;
  /** Fade/rise out over [a, b]. */
  out?: [number, number];
  /** Extra transform hooks (board px offsets). */
  dx?: () => number;
  dy?: () => number;
  opacity?: () => number;
}

export interface LaidWord {
  text: string;
  x: number; // offset from line start
  w: number;
  start: number; // char index in line
}

export function layoutLine(text: string, size: number, weight: number = FONT.bold) {
  const words: LaidWord[] = [];
  const space = measure(' ', size, weight);
  let x = 0;
  let start = 0;
  for (const w of text.split(' ')) {
    const width = measure(w, size, weight);
    words.push({text: w, x, w: width, start});
    x += width + space;
    start += w.length + 1;
  }
  return {words, width: x - space, space};
}

/** One line of headline type, animated with one of the guide's text moves. */
export function TextLine(p: TextLineProps) {
  const weight = p.weight ?? FONT.bold;
  const {words, width} = layoutLine(p.text, p.size, weight);
  const keyFrom = p.keyFrom ?? (p.paint ? 0 : Infinity);
  const keyStart = keyFrom < words.length ? words[keyFrom].x : 0;
  const keyEnd = width;
  const t = p.t;
  const a = p.anim;

  const outFactor = () => (p.out ? 1 - prog(t(), p.out[0], p.out[1]) : 1);
  const outRise = () => (p.out ? -24 * prog(t(), p.out[0], p.out[1]) : 0);

  const fillFor = (i: number) => {
    const w = words[i];
    if (i < keyFrom) return p.fill ?? COLORS.white;
    if (p.paint === 'sky') {
      return () => linear(keyStart - w.x, 0, keyEnd - w.x, 0, [COLORS.sky, '#E6F3FF']);
    }
    return () => {
      const sweep = p.sweepAt === undefined ? -1 : clamp01((t() - p.sweepAt) / 16) * 1.3 - 0.15;
      const s = p.sweepAt !== undefined && t() >= p.sweepAt && t() <= p.sweepAt + 16 ? sweep : -1;
      return keyGradient(keyStart - w.x, keyEnd - w.x, s);
    };
  };

  // Per-word visibility/transform depending on the animation kind.
  const wordAlpha = (i: number) => () => {
    const f = t();
    switch (a.kind) {
      case 'rise': {
        const s = a.at + i * (a.stagger ?? 3);
        return clamp01((f - s) / ((a.dur ?? 12) * 0.6));
      }
      case 'kinetic':
        return clamp01((f - a.at) / 4);
      case 'type':
      case 'wipe':
      case 'static':
        return f >= (a.kind === 'static' ? -Infinity : a.at) ? 1 : 0;
    }
  };
  const wordDy = (i: number) => () => {
    if (a.kind !== 'rise') return 0;
    const s = a.at + i * (a.stagger ?? 3);
    return 34 * (1 - prog(t(), s, s + (a.dur ?? 12)));
  };
  const wordBlur = (i: number) => () => {
    if (a.kind !== 'rise') return 0;
    const s = a.at + i * (a.stagger ?? 3);
    return 12 * (1 - prog(t(), s, s + (a.dur ?? 12)));
  };
  const lineDx = () => {
    if (a.kind !== 'kinetic') return 0;
    const pr = backOut(0.04)(clamp01((t() - a.at) / (a.dur ?? 10)));
    return a.from * 260 * (1 - pr);
  };
  const typed = () => {
    if (a.kind !== 'type') return Infinity;
    return Math.max(0, Math.floor((t() - a.at) / (a.perChar ?? 2)) + 1);
  };
  const wordText = (i: number) => () => {
    const n = typed() - words[i].start;
    if (n <= 0) return '';
    return words[i].text.slice(0, n);
  };

  const line = new Node({
    x: () => X(p.x) + lineDx() + (p.dx?.() ?? 0),
    y: () => Y(p.baseline) + outRise() + (p.dy?.() ?? 0),
    opacity: () => outFactor() * (p.opacity?.() ?? 1),
  });

  // Ghost trail for the kinetic stack.
  if (a.kind === 'kinetic') {
    const ghost = new Node({
      x: () => a.from * 170 * (1 - prog(t(), a.at + 2, a.at + 22, easeOutCubic)) - lineDx(),
      opacity: () => {
        const f = t() - a.at;
        return f < 0 ? 0 : 0.28 * (1 - clamp01((f - 6) / 16));
      },
      filters: [blur(8)],
    });
    words.forEach((w, i) =>
      ghost.add(new Word({content: w.text, size: p.size, weight, x: w.x, fill: fillFor(i)})),
    );
    line.add(ghost);
  }

  const outline = p.outline;
  words.forEach((w, i) => {
    const isOutline = outline && i >= outline.from;
    const group = new Node({
      x: w.x,
      y: wordDy(i),
      opacity: wordAlpha(i),
      filters: a.kind === 'rise' ? [blur(wordBlur(i))] : [],
    });
    if (isOutline) {
      group.add(
        new Word({
          content: w.text,
          size: p.size,
          weight,
          fill: null,
          stroke: COLORS.orange,
          lineWidth: 3,
        }),
      );
      // Fill wipes in right → left over 12f, as on the guide board.
      const oStart = words[outline!.from].x;
      const oWidth = width - oStart;
      const left = () => {
        const pr = prog(t(), outline!.fillAt, outline!.fillAt + 12, linearEase);
        return Math.max(-6, oStart + (1 - pr) * oWidth - w.x);
      };
      // Children of a Rect sit relative to its center, so position by center.
      const cw = () => Math.max(0, w.w + 12 - left());
      const cx = () => left() + cw() / 2;
      const clip = new Rect({
        x: cx,
        y: -p.size * 0.35,
        width: cw,
        height: p.size * 1.6,
        clip: true,
      });
      clip.add(new Word({content: w.text, size: p.size, weight, x: () => -cx(), y: p.size * 0.35, fill: fillFor(i)}));
      group.add(clip);
    } else {
      group.add(new Word({content: wordText(i), size: p.size, weight, fill: fillFor(i)}));
    }
    line.add(group);
  });

  if (a.kind === 'wipe') {
    // Clip whole line, reveal left→right behind a glowing orange bar.
    const pr = () => prog(t(), a.at, a.at + (a.dur ?? 14), linearEase);
    const cw = () => pr() * (width + 20);
    const clip = new Rect({
      x: () => cw() / 2,
      y: -p.size * 0.35,
      width: cw,
      height: p.size * 1.6,
      clip: true,
    });
    const kids = [...line.children()];
    for (const k of kids) {
      const x0 = k.x();
      k.remove();
      k.x(() => x0 - cw() / 2);
      k.y(p.size * 0.35);
      clip.add(k);
    }
    line.add(clip);
    line.add(
      new Rect({
        x: () => pr() * (width + 20),
        y: -p.size * 0.38,
        width: 14,
        height: p.size * 1.12,
        radius: 7,
        fill: COLORS.orange,
        shadowColor: COLORS.orange,
        shadowBlur: 24,
        opacity: () => {
          const f = t();
          if (f < a.at) return 0;
          return 1 - prog(f, a.at + (a.dur ?? 14), a.at + (a.dur ?? 14) + 6);
        },
      }),
    );
  }

  if (a.kind === 'type' && a.cursor) {
    const [c0, c1] = a.cursor;
    const total = p.text.length;
    line.add(
      new Rect({
        offset: [-1, 0],
        x: () => {
          const n = Math.min(typed(), total);
          return measure(p.text.slice(0, n), p.size, weight) + 10;
        },
        y: -p.size * 0.36,
        width: 12,
        height: p.size * 0.95,
        fill: COLORS.sky,
        shadowColor: COLORS.sky,
        shadowBlur: 18,
        opacity: () => {
          const f = t();
          if (f < c0 || f >= c1) return 0;
          const typing = typed() <= total;
          if (typing) return 1;
          const idle = f - (a.at + total * (a.perChar ?? 2));
          return Math.floor(idle / 15) % 2 === 0 ? 1 : 0;
        },
      }),
    );
  }

  return line;
}
