import { defineConfig } from 'vite';
// base './' lets the built site be hosted from any path (GitHub Pages, Cloudflare Pages...).
export default defineConfig({ base: './', server: { host: true } });
