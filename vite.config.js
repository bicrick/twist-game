import { defineConfig } from 'vite';
import { execSync } from 'child_process';
// A build id (commit + time) baked into the bundle: shown in the ?debug=1 panel and as window.__BUILD__, so you can tell
// which version a phone is actually running.
let commit = process.env.COMMIT || 'nogit'; if (commit === 'nogit') try { commit = execSync('git rev-parse --short HEAD').toString().trim(); } catch (e) {}
// absolute site URL for the social-card tags in index.html (%VITE_SITE%)
process.env.VITE_SITE = process.env.VITE_SITE || 'https://twist-game.vercel.app';
// Root-absolute assets so /embed and /embed/ load the same files with no redirect.
// Web Analytics for this static site is the HTML snippet from Vercel's quickstart
// (not the @vercel/analytics package, and not Speed Insights). Production builds only.
function vercelWebAnalytics() {
  const snippet = `<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>`;
  return {
    name: 'vercel-web-analytics',
    apply: 'build',
    transformIndexHtml(html) { return html.replace('</head>', snippet + '\n</head>'); },
  };
}
export default defineConfig({
  base: '/',
  server: { host: true },
  plugins: [vercelWebAnalytics()],
  define: { __BUILD__: JSON.stringify(commit + ' ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z') },
});
