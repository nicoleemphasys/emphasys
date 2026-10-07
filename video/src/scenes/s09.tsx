// Scene 9 · Come add your tile (frames 1890–2250) — ends on the loop seam.
import {Img, Node, Rect, blur, makeScene2D} from '@motion-canvas/2d';
import {Vector2, easeInOutCubic, easeOutCubic} from '@motion-canvas/core';
import {COLORS, COPY, FONT, FOOTAGE} from '../config';
import {X, Y, lerp, prog} from '../lib';
import {clock} from '../scene';
import {FallingTile, OpeningShot} from '../components/Opening';
import {Background, OrbNode, Placeholder, Roofline, Vignette, drift} from '../components/Scenery';
import {TextLine} from '../components/TextLine';
import {Word} from '../components/Word';
import logoSrc from '../assets/logo-reversed.png';

// Reversed logo (2000×667 source). Big pose: 900px wide, centered at (960, 600).
const LOGO_W = 900;
const LS = LOGO_W / 2000;
const LOGO_TL = new Vector2(960 - LOGO_W / 2, 600 - (667 * LS) / 2);
// Roof centerline of the logo artwork in source px.
const ROOF = [new Vector2(676, 268), new Vector2(984, 34), new Vector2(1300, 268)];
const logoRoof = () => ROOF.map(v => new Vector2(LOGO_TL.x + v.x * LS, LOGO_TL.y + v.y * LS));
const flat = [new Vector2(240, 880), new Vector2(960, 880), new Vector2(1680, 880)];
const big = [new Vector2(655, 510), new Vector2(960, 245), new Vector2(1265, 510)];
const lerpPts = (a: Vector2[], b: Vector2[], p: number) => a.map((v, i) => Vector2.lerp(v, b[i], p));

export default makeScene2D(function* (view) {
  const {t, n, run} = clock('s09');
  const c = COPY.s09;
  const T = () => t() - n; // frames relative to the loop point (−360 … 0)

  view.add(
    Background({
      orbs: [
        {x: 960, y: 520, r: 700, color: '#2F86E0', opacity: () => 0.8 - 0.3 * prog(t(), 110, 140)},
        {x: drift(t, 1520, 40, 260), y: 330, r: 640, color: '#2F86E0', opacity: () => 0.75 * prog(t(), 110, 140)},
      ],
    }),
  );
  view.add(OrbNode({x: 1060, y: 820, r: 460, color: '#F76B13', opacity: () => 0.4 * (1 - prog(t(), 100, 130))}));

  // Roofline: timeline bends up into a chevron, then lands on the logo's roof.
  const bend = () => prog(t(), 0, 26, easeInOutCubic);
  const land = () => prog(t(), 58, 76, easeInOutCubic);
  view.add(
    Roofline({
      points: () => lerpPts(lerpPts(flat, big, bend()), logoRoof(), land()),
      end: 1,
      width: 10,
      opacity: () => 1 - prog(t(), 78, 90),
    }),
  );

  // Logo: rises in under the roof, holds, then docks top-left in a glass pill.
  const dock = () => prog(t(), 108, 128, easeInOutCubic);
  const pill = new Rect({
    offset: [-1, -1],
    x: X(140),
    y: Y(110),
    width: 300,
    height: 100,
    radius: 26,
    fill: 'rgba(255,255,255,0.08)',
    stroke: 'rgba(255,255,255,0.2)',
    lineWidth: 1.5,
    opacity: () => prog(t(), 118, 130) * (1 - prog(t(), 322, 336)),
  });
  view.add(pill);
  const smallScale = 240 / LOGO_W;
  const logo = new Node({
    x: () => X(lerp(960, 290, dock())),
    y: () => Y(lerp(600, 160, dock())) + 30 * (1 - prog(t(), 60, 78, easeOutCubic)),
    scale: () => lerp(1, smallScale, dock()),
    opacity: () => prog(t(), 60, 72) * (1 - prog(t(), 322, 336)),
    filters: [blur(() => 12 * (1 - prog(t(), 60, 76)))],
  });
  logo.add(new Img({src: logoSrc, width: LOGO_W}));
  view.add(logo);

  // Tagline.
  const tagOut: [number, number] = [212, 222];
  view.add(TextLine({t, text: c.tagline[0], x: 140, baseline: 552, size: 160, anim: {kind: 'rise', at: 128}, out: tagOut}));
  view.add(TextLine({t, text: c.tagline[1], x: 140, baseline: 735, size: 160, keyFrom: 1, anim: {kind: 'rise', at: 144}, out: tagOut}));

  // Question + booth call to action, footage on the right.
  const endOut: [number, number] = [322, 334];
  const panelIn = () => prog(t(), 222, 240, easeOutCubic);
  const expand = () => prog(t(), 322, 344, easeInOutCubic);
  view.add(
    Placeholder({
      x: () => lerp(1100 + 400 * (1 - panelIn()), 0, expand()),
      y: 0,
      w: () => lerp(820, 1920, expand()),
      h: 1080,
      file: FOOTAGE.s09TileDrop.file,
      note: FOOTAGE.s09TileDrop.note,
      opacity: () => panelIn(),
      border: false,
    }),
  );
  view.add(TextLine({t, text: c.question[0], x: 140, baseline: 450, size: 140, anim: {kind: 'rise', at: 226}, out: endOut}));
  view.add(
    TextLine({t, text: c.question[1], x: 140, baseline: 583, size: 140, paint: 'key', sweepAt: 270, anim: {kind: 'rise', at: 236}, out: endOut}),
  );
  const booth = new Node({
    y: () => 24 * (1 - prog(t(), 250, 262, easeOutCubic)),
    opacity: () => prog(t(), 250, 258) * (1 - prog(t(), endOut[0], endOut[1])),
  });
  booth.add(
    new Rect({
      offset: [-1, -1],
      x: X(140),
      y: Y(690),
      width: 800,
      height: 120,
      radius: 60,
      fill: 'rgba(255,255,255,0.10)',
      stroke: 'rgba(255,255,255,0.24)',
      lineWidth: 1.5,
    }),
  );
  booth.add(new Word({content: c.booth, size: 60, weight: FONT.medium, x: X(184), y: Y(771), fill: COLORS.white}));
  view.add(booth);

  // Loop seam: the tile falls, the opening shot fades up, frame 2249 → frame 0.
  const seam = () => prog(t(), 338, 352, easeInOutCubic);
  const tile = new Node({opacity: () => 1 - seam()});
  tile.add(FallingTile(T));
  view.add(tile);
  const opening = OpeningShot(T);
  opening.opacity(seam);
  view.add(opening);

  view.add(Vignette());
  yield* run();
});
