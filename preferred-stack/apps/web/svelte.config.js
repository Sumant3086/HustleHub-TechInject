import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  },
  onwarn: (warning, handler) => {
    // Suppress warnings about unused props that SvelteKit provides
    if (warning.code === 'unused-export-let') {
      return;
    }
    // Suppress a11y warnings for drag-and-drop elements
    if (warning.code === 'a11y-no-static-element-interactions') {
      return;
    }
    handler(warning);
  }
};

export default config;
