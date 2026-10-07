import {Node} from '@motion-canvas/2d';
import {createSignal, linear, ThreadGenerator} from '@motion-canvas/core';
import {FPS, SceneId, sceneLength} from './config';

/**
 * Every scene is driven by one frame counter `t` (scene-local frames), so
 * every property is a pure function of time and lands on exact frames.
 */
export function clock(id: SceneId) {
  const n = sceneLength(id);
  const t = createSignal(0);
  const run = function* (): ThreadGenerator {
    // A scene whose generator ends at time d occupies d·fps + 1 frames, so
    // stop one frame early: t equals the frame index and the scene is n frames.
    yield* t(n - 1, (n - 1) / FPS, linear);
  };
  return {t, n, run};
}

export function addAll(view: Node, nodes: Node[]) {
  for (const n of nodes) view.add(n);
}
