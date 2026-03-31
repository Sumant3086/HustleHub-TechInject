import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  },
  onwarn: (warning, handler) => {
    if (warning.code === 'unused-export-let') return;
    if (warning.code === 'a11y-no-static-element-interactions') return;
    handler(warning);
  }
};

export default config;
