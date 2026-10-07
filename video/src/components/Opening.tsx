import {Node} from '@motion-canvas/2d';
import {Vector2, easeInOutCubic} from '@motion-canvas/core';
import {FOOTAGE, HEIGHT, WIDTH} from '../config';
import {clamp01, prog} from '../lib';
import {Background, Placeholder, Roofline, drift} from './Scenery';

/**
 * The loop seam. `T` is frames relative to frame 0 of the video: scene 1 plays
 * it with T = 0…, scene 9 plays the same function with T = −N…−1, so the last
 * frame and the first frame are one continuous motion (falling tile → keys).
 */
export function OpeningShot(T: () => number) {
  const root = new Node({});
  root.add(
    Background({
      orbs: [
        {x: drift(T, 1600, 40, 300), y: drift(T, 560, 30, 260, 1), r: 720, color: '#2F7FD0', opacity: 0.55},
        {x: 980, y: 420, r: 520, color: '#2A6FC0', opacity: 0.35},
      ],
    }),
  );
  // Full-screen keys footage, push-in 105% → 112% across scene 1.
  root.add(
    Placeholder({
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      file: FOOTAGE.s01Keys.file,
      note: FOOTAGE.s01Keys.note,
      play: true,
      border: false,
      labelInset: [31, 32],
      scale: () => 1.05 + 0.07 * (T() / 180),
      opacity: 0.9,
      // Note text only reads while nothing else is on screen.
      noteOpacity: () => (T() < 0 ? prog(T(), -14, -4) : 1 - prog(T(), 18, 28)),
    }),
  );

  root.add(FallingTile(T));
  return root;
}

/** Small roofline "tile" mid-fall: continuous parabola through T = 0. */
export function FallingTile(T: () => number) {
  const fall = () => {
    const u = T() + 40; // starts falling at T = −40
    return 0.5 * 0.325 * u * u - 260; // 0 at T = 0, off-screen by T ≈ 40
  };
  return Roofline({
    points: () => {
      const dy = fall();
      return [new Vector2(810, 570 + dy), new Vector2(960, 420 + dy), new Vector2(1110, 570 + dy)];
    },
    end: () => clamp01(0.2 + 0.35 * ((T() + 40) / 40)),
    opacity: () => Math.min(prog(T(), -40, -30), 1 - prog(T(), 22, 36, easeInOutCubic)),
    width: 12,
  });
}
