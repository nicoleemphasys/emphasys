import {Circle, Img, Line, Node, Rect, Txt, blur} from '@motion-canvas/2d';
import {Vector2} from '@motion-canvas/core';
import {COLORS, FONT, HEIGHT, VESSELS, WIDTH} from '../config';
import {P, X, Y, linear, prog, radial, stripes} from '../lib';

type Num = number | (() => number);
const val = (v: Num | undefined, d = 0) => (v === undefined ? d : typeof v === 'function' ? v() : v);

// ---------- background ----------
export interface Orb {
  x: Num;
  y: Num;
  r: number;
  color: string;
  opacity?: Num;
}

/** Deep → navy gradient with large soft orbs. */
export function Background(props: {orbs?: Orb[]; dim?: Num}) {
  const root = new Node({});
  root.add(
    new Rect({
      width: WIDTH,
      height: HEIGHT,
      fill: linear(-WIDTH / 2, -HEIGHT / 2, WIDTH / 2, HEIGHT / 2, [COLORS.deep, '#0E3A78', '#1B4687']),
    }),
  );
  for (const o of props.orbs ?? []) root.add(OrbNode(o));
  if (props.dim !== undefined) {
    root.add(new Rect({width: WIDTH, height: HEIGHT, fill: '#03204A', opacity: () => val(props.dim)}));
  }
  return root;
}

export function OrbNode(o: Orb) {
  return new Circle({
    x: () => X(val(o.x)),
    y: () => Y(val(o.y)),
    size: o.r * 2,
    fill: radial(0, o.r, [hexA(o.color, 0.75), hexA(o.color, 0.32), hexA(o.color, 0)]),
    opacity: () => val(o.opacity, 1),
  });
}

export function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Slow drift helper for orbs. */
export const drift = (t: () => number, base: number, amp: number, period: number, phase = 0) => () =>
  base + amp * Math.sin((t() / period) * Math.PI * 2 + phase);

/** Soft vignette on every frame. */
export function Vignette() {
  return new Rect({
    width: WIDTH,
    height: HEIGHT,
    fill: radial(WIDTH * 0.3, WIDTH * 0.62, ['rgba(2,14,38,0)', 'rgba(2,14,38,0.18)', 'rgba(2,14,38,0.55)']),
  });
}

/** Faint 120px data grid (scene 7). */
export function Grid(props: {opacity?: Num}) {
  const g = new Node({opacity: () => val(props.opacity, 1)});
  for (let x = 0; x <= WIDTH; x += 120) {
    g.add(new Line({points: [P(x, 0), P(x, HEIGHT)], stroke: 'rgba(67,167,249,0.12)', lineWidth: 1.5}));
  }
  for (let y = 0; y <= HEIGHT; y += 120) {
    g.add(new Line({points: [P(0, y), P(WIDTH, y)], stroke: 'rgba(67,167,249,0.12)', lineWidth: 1.5}));
  }
  return g;
}

// ---------- footage placeholder ----------
export interface PlaceholderProps {
  x: Num; // top-left, board px
  y: Num;
  w: Num;
  h: Num;
  radius?: number;
  circle?: boolean;
  file: string;
  note?: string;
  play?: boolean | (() => number);
  border?: boolean;
  labelSolid?: boolean;
  /** Label position relative to the box's bottom-left. */
  labelInset?: [number, number];
  opacity?: Num;
  scale?: Num;
  blur?: Num;
  noteOpacity?: Num;
}

/**
 * Striped, navy-graded stand-in for a footage clip. Phase 2 swaps the
 * gradient+stripes for the real clip with a navy duotone.
 */
export function Placeholder(p: PlaceholderProps) {
  const w = () => val(p.w);
  const h = () => val(p.h);
  const root = new Node({
    x: () => X(val(p.x) + w() / 2),
    y: () => Y(val(p.y) + h() / 2),
    opacity: () => val(p.opacity, 1),
    filters: p.blur !== undefined ? [blur(() => val(p.blur))] : [],
  });
  const radius = p.circle ? () => Math.min(w(), h()) / 2 : p.radius ?? 0;
  const box = new Rect({
    width: w,
    height: h,
    radius,
    clip: true,
    fill: () => linear(-w() / 2, -h() / 2, w() / 2, h() / 2, ['#123A78', '#1B4C93', '#2F6DB5']),
  });
  // Push-ins scale the picture inside the frame, never the frame or label.
  box.add(new Rect({width: () => w() + 60, height: () => h() + 60, fill: stripes(), scale: () => val(p.scale, 1)}));
  box.add(
    new Rect({
      width: w,
      height: h,
      fill: () => linear(-w() / 2, -h() / 2, w() / 2, h() / 2, ['rgba(5,46,101,0.45)', 'rgba(5,46,101,0)']),
    }),
  );
  root.add(box);
  if (p.border !== false) {
    root.add(
      new Rect({
        width: w,
        height: h,
        radius,
        stroke: 'rgba(200,220,255,0.45)',
        lineWidth: 2,
        lineDash: [6, 5],
      }),
    );
  }
  if (p.play) {
    const playA = typeof p.play === 'function' ? p.play : () => 1;
    root.add(new Circle({size: 118, stroke: 'rgba(255,255,255,0.45)', lineWidth: 3, opacity: playA}));
    root.add(
      new Line({
        points: [new Vector2(-14, -22), new Vector2(24, 0), new Vector2(-14, 22)],
        closed: true,
        fill: 'rgba(255,255,255,0.55)',
        opacity: playA,
      }),
    );
  }
  const [ix, iy] = p.labelInset ?? [30, 32];
  const label = new Node({
    x: () => -w() / 2 + ix,
    y: () => h() / 2 - iy - 20,
  });
  const labelW = measureLabel(p.file);
  label.add(
    new Rect({
      offset: [-1, 0],
      width: labelW + 24,
      height: 40,
      radius: 6,
      fill: p.labelSolid ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
    }),
  );
  label.add(
    new Txt({
      offset: [-1, 0],
      x: 12,
      text: p.file,
      fontFamily: FONT.family,
      fontWeight: 700,
      fontSize: 22,
      fill: '#0B2A5C',
    }),
  );
  if (p.note) {
    const lines = p.note.split('\n');
    lines.forEach((text, i) =>
      label.add(
        new Txt({
          offset: [-1, 0],
          x: labelW + 40,
          y: (i - (lines.length - 1) / 2) * 33,
          text,
          fontFamily: FONT.family,
          fontWeight: 400,
          fontSize: 26,
          fill: 'rgba(255,255,255,0.6)',
          opacity: () => val(p.noteOpacity, 1),
        }),
      ),
    );
  }
  root.add(label);
  return root;
}

function measureLabel(text: string) {
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `700 22px ${FONT.family}`;
  return c.measureText(text).width;
}

// ---------- roofline ----------
/** Orange → sky chevron that draws itself with a glow. */
export function Roofline(p: {
  points: () => Vector2[]; // board px
  end: Num;
  start?: Num;
  width?: number;
  opacity?: Num;
}) {
  const pts = () => p.points().map(v => P(v.x, v.y));
  return new Line({
    points: pts,
    lineWidth: p.width ?? 10,
    lineCap: 'round',
    lineJoin: 'round',
    end: () => val(p.end),
    start: () => val(p.start, 0),
    opacity: () => (val(p.end) - val(p.start, 0) > 0.002 ? val(p.opacity, 1) : 0),
    stroke: () => {
      const xs = pts().map(v => v.x);
      return linear(Math.min(...xs), 0, Math.max(...xs), 0, [COLORS.orange, '#B5928A', '#7FB4E6', COLORS.sky]);
    },
    shadowColor: 'rgba(247,107,19,0.75)',
    shadowBlur: 22,
  });
}

// ---------- vessel tag ----------
/** Glass pill + five-dot tracker, fixed top-left in scenes 3–7. */
export function VesselTag(p: {index: number; opacity?: Num; blur?: Num}) {
  const label = VESSELS[p.index];
  const size = 36;
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `500 ${size}px ${FONT.family}`;
  const textW = c.measureText(label).width;
  const pillW = textW + 100;
  const root = new Node({
    opacity: () => val(p.opacity, 1),
    filters: p.blur !== undefined ? [blur(() => val(p.blur))] : [],
  });
  root.add(
    new Rect({
      offset: [-1, 0],
      x: X(140),
      y: Y(150),
      width: pillW,
      height: 80,
      radius: 40,
      fill: 'rgba(255,255,255,0.08)',
      stroke: 'rgba(255,255,255,0.2)',
      lineWidth: 1.5,
    }),
  );
  root.add(new Circle({x: X(173), y: Y(151), size: 20, fill: COLORS.orange, shadowColor: COLORS.orange, shadowBlur: 14}));
  root.add(
    new Txt({
      offset: [-1, 0],
      x: X(200),
      y: Y(151),
      text: label,
      fontFamily: FONT.family,
      fontWeight: 500,
      fontSize: size,
      fill: 'rgba(255,255,255,0.88)',
    }),
  );
  const dotsX = 140 + pillW + 36;
  for (let i = 0; i < 5; i++) {
    const color = i < p.index ? COLORS.sky : i === p.index ? COLORS.orange : 'rgba(255,255,255,0.3)';
    root.add(
      new Circle({
        x: X(dotsX + i * 26),
        y: Y(151),
        size: 13,
        fill: color,
        shadowColor: i === p.index ? COLORS.orange : 'rgba(0,0,0,0)',
        shadowBlur: i === p.index ? 12 : 0,
      }),
    );
  }
  return root;
}

// ---------- small pieces ----------
export function Glass(p: {x: Num; y: Num; w: number; h: number; radius?: number; opacity?: Num; rotation?: Num; scale?: Num}) {
  return new Rect({
    offset: [-1, -1],
    x: () => X(val(p.x)),
    y: () => Y(val(p.y)),
    width: p.w,
    height: p.h,
    radius: p.radius ?? 28,
    fill: 'rgba(255,255,255,0.10)',
    stroke: 'rgba(255,255,255,0.22)',
    lineWidth: 1.5,
    opacity: () => val(p.opacity, 1),
    rotation: () => val(p.rotation, 0),
    scale: () => val(p.scale, 1),
  });
}

/** Orange check badge. `draw` 0→1 animates the tick. */
export function CheckBadge(p: {x: number; y: number; r: number; pop: Num; draw?: Num}) {
  const root = new Node({x: X(p.x), y: Y(p.y), scale: () => val(p.pop), opacity: () => Math.min(1, val(p.pop) * 2)});
  root.add(new Circle({size: p.r * 2, fill: COLORS.orange, shadowColor: 'rgba(247,107,19,0.8)', shadowBlur: 22}));
  const k = p.r / 32;
  root.add(
    new Line({
      points: [new Vector2(-11 * k, 1 * k), new Vector2(-3 * k, 10 * k), new Vector2(12 * k, -10 * k)],
      stroke: COLORS.white,
      lineWidth: 5 * k,
      lineCap: 'round',
      lineJoin: 'round',
      end: () => val(p.draw, 1),
    }),
  );
  return root;
}

export {prog};
