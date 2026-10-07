import {defineConfig} from 'vite';
import mcPlugin from '@motion-canvas/vite-plugin';

// The plugin ships as CJS; unwrap the default export under ESM.
const motionCanvas = ((mcPlugin as any).default ?? mcPlugin) as typeof mcPlugin;

export default defineConfig({
  plugins: [motionCanvas({project: './src/project.ts', output: './output'})],
  build: {target: 'esnext'},
  esbuild: {target: 'esnext'},
  optimizeDeps: {esbuildOptions: {target: 'esnext'}},
});
