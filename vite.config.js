import { defineConfig } from 'vite';
import { execSync } from 'child_process';
// A build id (commit + time) baked into the bundle: shown in the ?debug=1 panel and as window.__BUILD__, so you can tell
// which version a phone is actually running.
let commit = 'nogit'; try { commit = execSync('git rev-parse --short HEAD').toString().trim(); } catch (e) {}
// base './' lets the built site be hosted from any path (GitHub Pages, Cloudflare Pages...).
export default defineConfig({ base: './', server: { host: true }, define: { __BUILD__: JSON.stringify(commit + ' ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z') } });
