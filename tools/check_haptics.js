// The haptics switch must follow platform capability, not "does vibrate exist?".
// Desktop Chrome has the function and returns true after a gesture without vibrating.
import { offerHaptics } from '../src/ui/haptics.js';

const fn = () => {};
let bad = 0;
const eq = (name, got, want) => {
  if (got !== want) { console.log('FAIL', name, 'got', got, 'want', want); bad++; }
};
eq('no API', offerHaptics({ vibrate: undefined, ua: 'Android', mobile: true }), false);
eq('iPhone even if a function exists', offerHaptics({ vibrate: fn, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1', mobile: true }), false);
eq('iPad', offerHaptics({ vibrate: fn, ua: 'iPad', mobile: true }), false);
eq('Android Chrome', offerHaptics({ vibrate: fn, ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', mobile: true, platform: 'Android' }), true);
eq('Android webview', offerHaptics({ vibrate: fn, ua: 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36', mobile: true }), true);
eq('desktop Chrome (mobile false)', offerHaptics({ vibrate: fn, ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', mobile: false, platform: 'Linux' }), false);
eq('desktop, platform only', offerHaptics({ vibrate: fn, ua: 'Chrome', mobile: false, platform: 'macOS' }), false);
eq('Android platform, reduced UA', offerHaptics({ vibrate: fn, ua: 'Mozilla/5.0 Chrome', mobile: true, platform: 'Android' }), true);
eq('unknown mobile', offerHaptics({ vibrate: fn, ua: 'SomeBrowser', mobile: true }), false);

console.log(bad ? bad + ' haptics check(s) failed' : 'haptics offer matrix ok');
process.exit(bad ? 1 : 0);
