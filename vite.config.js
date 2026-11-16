import { defineConfig } from 'vite';
import { execSync } from 'child_process';
// A build id (commit + time) baked into the bundle: shown in the ?debug=1 panel and as window.__BUILD__, so you can tell
// which version a phone is actually running.
let commit = process.env.COMMIT || 'nogit'; if (commit === 'nogit') try { commit = execSync('git rev-parse --short HEAD').toString().trim(); } catch (e) {}
// absolute site URL for the social-card tags in index.html (%VITE_SITE%)
process.env.VITE_SITE = process.env.VITE_SITE || 'https://twist-game.vercel.app';
// Root-absolute assets so /embed and /embed/ load the same files with no redirect.
export default defineConfig({ base: '/', server: { host: true }, define: { __BUILD__: JSON.stringify(commit + ' ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z') } });
