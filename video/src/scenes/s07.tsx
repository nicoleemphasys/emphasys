// Scene 7 · More useful insight (frames 1440–1680)
// Charts and the map carry no numbers or labels.
import {Circle, Line, Node, Rect, makeScene2D} from '@motion-canvas/2d';
import {Vector2, easeOutCubic, linear as linearEase} from '@motion-canvas/core';
import {COLORS, COPY, FOOTAGE} from '../config';
import {P, X, Y, along, linear, prog} from '../lib';
import {clock} from '../scene';
import {Background, Grid, OrbNode, Placeholder, Vignette, VesselTag} from '../components/Scenery';
import {TextLine} from '../components/TextLine';

const BAR_TOPS = [840, 780, 810, 720, 750, 660, 680, 600, 630, 540];
const TREND = [
  [180, 680], [360, 638], [540, 660], [720, 550], [900, 570],
  [1080, 460], [1260, 480], [1440, 360], [1620, 310], [1740, 260],
].map(([x, y]) => new Vector2(x, y));

// Network map: plain nodes, highlighted (orange) nodes and links.
const NODES = [
  [288, 343], [553, 368], [773, 351], [596, 428], [709, 442], [736, 479], [824, 525], [530, 498], [214, 558],
  [683, 570], [411, 665], [240, 671], [294, 733], [1045, 467], [1180, 418], [1241, 459], [1103, 542], [1372, 579],
  [1482, 547], [1634, 611], [1484, 641], [1082, 722], [1047, 693], [994, 778], [1264, 808], [377, 880], [891, 947],
];
const HOT = [
  [384, 328], [600, 328], [320, 487], [733, 538], [834, 556], [937, 543], [1321, 567], [1426, 555], [706, 744], [252, 916], [497, 949],
];
const LINKS: [number[], number[]][] = [
  [[288, 343], [824, 525]], [[553, 368], [736, 479]], [[596, 428], [994, 778]], [[773, 351], [1321, 567]],
  [[384, 328], [240, 671]], [[320, 487], [1264, 808]], [[411, 665], [683, 570]], [[1045, 467], [1634, 1000]],
  [[1241, 459], [1372, 579]], [[377, 880], [1484, 641]], [[497, 949], [1634, 611]], [[1482, 547], [1264, 808]],
  [[1082, 722], [1426, 555]],
];

export default makeScene2D(function* (view) {
  const {t, run} = clock('s07');
  const c = COPY.s07;

  view.add(Background({orbs: [{x: 960, y: 560, r: 760, color: '#2A6FC0', opacity: 0.55}], dim: 0.35}));
  view.add(Grid({opacity: 0.9}));

  // A/C · Bars + trend line. Visible, hides for the map, returns dimmed under the type.
  const chartA = () => {
    const f = t();
    if (f < 130) return 1 - prog(f, 54, 66);
    return 0.42 * prog(f, 130, 148);
  };
  const chart = new Node({opacity: chartA});
  BAR_TOPS.forEach((top, i) => {
    const grow = () => prog(t(), -6 + i, 8 + i, easeOutCubic);
    chart.add(
      new Rect({
        offset: [0, 1],
        x: X(255 + i * 150),
        y: Y(960),
        width: 70,
        height: () => (960 - top) * grow(),
        radius: [12, 12, 0, 0],
        fill: linear(0, -(960 - top), 0, 0, ['#4DB0FF', 'rgba(67,167,249,0.15)']),
      }),
    );
  });
  const drawn = () => prog(t(), -30, 34, linearEase);
  chart.add(
    new Line({
      points: TREND.map(v => P(v.x, v.y)),
      stroke: COLORS.orange,
      lineWidth: 8,
      lineJoin: 'round',
      lineCap: 'round',
      end: drawn,
      shadowColor: 'rgba(247,107,19,0.8)',
      shadowBlur: 18,
    }),
  );
  chart.add(
    new Circle({
      position: () => {
        const p = along(TREND, drawn());
        return P(p.x, p.y);
      },
      size: 40,
      fill: COLORS.white,
      shadowColor: COLORS.orange,
      shadowBlur: 24,
      opacity: () => 1 - prog(t(), 40, 50),
    }),
  );
  view.add(chart);

  // B · Agency map: links draw, nodes pop, hot spots pulse.
  const mapA = () => prog(t(), 60, 72) * (1 - prog(t(), 128, 142));
  const map = new Node({opacity: mapA});
  LINKS.forEach(([a, b], i) =>
    map.add(
      new Line({
        points: [P(a[0], a[1]), P(b[0], b[1])],
        stroke: 'rgba(67,167,249,0.6)',
        lineWidth: 2,
        end: () => prog(t(), 66 + i * 2, 90 + i * 2),
      }),
    ),
  );
  NODES.forEach(([x, y], i) =>
    map.add(new Circle({x: X(x), y: Y(y), size: 15, fill: 'rgba(220,232,250,0.75)', scale: () => prog(t(), 62 + (i % 9), 70 + (i % 9), easeOutCubic)})),
  );
  HOT.forEach(([x, y], i) => {
    const at = 70 + i * 3;
    map.add(
      new Circle({
        x: X(x),
        y: Y(y),
        size: () => 52 + 10 * Math.sin((t() - at) / 6),
        stroke: 'rgba(247,107,19,0.6)',
        lineWidth: 2.5,
        opacity: () => prog(t(), at, at + 8),
      }),
    );
    map.add(
      new Circle({x: X(x), y: Y(y), size: 30, fill: COLORS.orange, shadowColor: COLORS.orange, shadowBlur: 12, scale: () => prog(t(), at, at + 8, easeOutCubic)}),
    );
  });
  view.add(map);
  view.add(
    Placeholder({
      x: 1442,
      y: 642,
      w: 336,
      h: 336,
      circle: true,
      file: FOOTAGE.s07Director.file,
      labelInset: [36, 30],
      labelSolid: true,
      opacity: () => prog(t(), 84, 98) * (1 - prog(t(), 128, 142)),
    }),
  );
  view.add(OrbNode({x: 960, y: 560, r: 600, color: '#1C4F99', opacity: () => 0.4 * prog(t(), 130, 150)}));

  // C · Headline.
  c.forEach((text, i) =>
    view.add(
      TextLine({
        t,
        text,
        x: 140,
        baseline: 395 + i * 115,
        size: 115,
        paint: i === 3 ? 'key' : undefined,
        sweepAt: i === 3 ? 196 : undefined,
        anim: {kind: 'rise', at: 144 + i * 10},
      }),
    ),
  );

  view.add(VesselTag({index: 4}));
  view.add(Vignette());
  yield* run();
});
