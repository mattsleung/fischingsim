import { defineConfig } from 'vite';

export default defineConfig({
  base: '/fischingsim/',
  build: {
    // Current Safari and Chrome on macOS support these APIs and syntax.
    target: ['chrome107', 'safari16'],
  },
});
