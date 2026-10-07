import {Gradient, Pattern} from '@motion-canvas/2d';
import {Color, Vector2, easeOutCubic, TimingFunction} from '@motion-canvas/core';
import {COLORS, FONT, HEIGHT, WIDTH} from './config';

// ---------- coordinates ----------
// Boards are specified in top-left pixel space; Motion Canvas is centered.
export const X = (x: number) => x - WIDTH / 2;
export const Y = (y: number) => y - HEIGHT / 2;
export const P = (x: number, y: number) => new Vector2(X(x), Y(y));

// ---------- timing ----------
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Eased progress of `t` between frames `a` and `b`. */
export function prog(t: number, a: number, b: number, ease: TimingFunction = easeOutCubic) {
  if (b <= a) return t >= b ? 1 : 0;
  return ease(clamp01((t - a) / (b - a)));
}

/** Fade in over [a,b] and out over [c,d]. */
export function window(t: number, a: number, b: number, c = Infinity, d = Infinity) {
  return Math.min(prog(t, a, b), 1 - prog(t, c, d));
}

/** Back-out easing with a configurable overshoot fraction (0.04 = 4%). */
export function backOut(overshoot: number): TimingFunction {
  // Solve for the classic easeOutBack constant giving the requested overshoot.
  // Peak of 1 + (s+1)(x-1)^3 + s(x-1)^2 is 1 + 4s^3 / (27(s+1)^2).
  let lo = 0, hi = 5;
  for (let i = 0; i < 40; i++) {
    const s = (lo + hi) / 2;
    const peak = (4 * s ** 3) / (27 * (s + 1) ** 2);
    if (peak > overshoot) hi = s; else lo = s;
  }
  const s = (lo + hi) / 2;
  return (x: number) => {
    const u = x - 1;
    return 1 + (s + 1) * u ** 3 + s * u ** 2;
  };
}

/** Deterministic pseudo-random in [-1,1] for shakes and noise. */
export function rand(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

// ---------- text measurement ----------
let measureCtx: CanvasRenderingContext2D | null = null;
export function measure(text: string, size: number, weight = FONT.bold) {
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d')!;
  }
  measureCtx.font = `${weight} ${size}px ${FONT.family}`;
  (measureCtx as any).letterSpacing = `${size * FONT.tracking}px`;
  return measureCtx.measureText(text).width;
}
export const tracking = (size: number) => size * FONT.tracking;

// ---------- colors / gradients ----------
const orangeA = new Color(COLORS.orange);
const orangeB = new Color(COLORS.orangeLight);
export const keyColorAt = (p: number) => Color.lerp(orangeA, orangeB, clamp01(p));

/**
 * Key-phrase fill: #F76B13 → #FF9A5C across [x0,x1] (local coords).
 * `sweep` in [0,1] moves a #FFF1E6 band across; outside [0,1] no band.
 */
export function keyGradient(x0: number, x1: number, sweep = -1, band = 0.12) {
  const stops: {offset: number; color: Color | string}[] = [];
  if (sweep <= -band || sweep >= 1 + band) {
    stops.push({offset: 0, color: orangeA}, {offset: 1, color: orangeB});
  } else {
    const a = sweep - band, b = sweep + band;
    stops.push({offset: 0, color: keyColorAt(0)});
    if (a > 0) stops.push({offset: Math.min(a, 1), color: keyColorAt(a)});
    if (sweep >= 0 && sweep <= 1) stops.push({offset: sweep, color: COLORS.band});
    if (b < 1) stops.push({offset: Math.max(b, 0), color: keyColorAt(b)});
    stops.push({offset: 1, color: keyColorAt(1)});
  }
  return new Gradient({type: 'linear', from: [x0, 0], to: [x1, 0], stops});
}

export function linear(x0: number, y0: number, x1: number, y1: number, colors: string[]) {
  return new Gradient({
    type: 'linear',
    from: [x0, y0],
    to: [x1, y1],
    stops: colors.map((color, i) => ({offset: i / (colors.length - 1), color})),
  });
}

export function radial(r0: number, r1: number, colors: string[]) {
  return new Gradient({
    type: 'radial',
    from: 0,
    to: 0,
    fromRadius: r0,
    toRadius: r1,
    stops: colors.map((color, i) => ({offset: i / (colors.length - 1), color})),
  });
}

// ---------- patterns ----------
let stripeCanvas: HTMLCanvasElement | null = null;
/** 45° stripes used by every footage placeholder. */
export function stripes() {
  if (!stripeCanvas) {
    const s = 28;
    stripeCanvas = document.createElement('canvas');
    stripeCanvas.width = s;
    stripeCanvas.height = s;
    const c = stripeCanvas.getContext('2d')!;
    c.strokeStyle = 'rgba(255,255,255,0.10)';
    c.lineWidth = 1.5;
    for (const o of [-s, 0, s]) {
      c.beginPath();
      c.moveTo(o, 0);
      c.lineTo(o + s, s);
      c.stroke();
    }
  }
  return new Pattern({image: stripeCanvas, repetition: 'repeat'});
}

/** Point at fraction `f` (0–1) along a polyline, by length. */
export function along(points: Vector2[], f: number) {
  const lens = points.slice(1).map((p, i) => p.sub(points[i]).magnitude);
  const total = lens.reduce((a, b) => a + b, 0);
  let d = clamp01(f) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) return Vector2.lerp(points[i], points[i + 1], Math.min(1, d / lens[i]));
    d -= lens[i];
  }
  return points[points.length - 1];
}
