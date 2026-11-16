// Host apps whose browser is a WKWebView or Android system WebView, not the system browser.
// X/Twitter on iOS appends "Twitter". Android Custom Tabs look like Chrome and return false
// (service workers work there). Used only to skip the service worker, which those webviews mishandle.
export function inAppWebView() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Twitter/i.test(ua)) return true;
  if (/Instagram|FBAN|FBAV|FB_IAB|Line\/|MicroMessenger|Snapchat|TikTok|musical_ly|Bytedance/i.test(ua)) return true;
  if (/\bwv\b/.test(ua)) return true;
  if (/iPhone|iPad|iPod/.test(ua) && /AppleWebKit/.test(ua) && !/Safari/i.test(ua)) return true;
  return false;
}
