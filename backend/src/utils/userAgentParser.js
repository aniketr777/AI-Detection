/**
 * Parses user-agent string to determine browser, operating system, and device type.
 * @param {string} ua - Raw User-Agent string from request headers
 * @returns {{ browser: string, os: string, device: string }}
 */
export function parseUserAgent(ua = '') {
  let browser = 'Unknown Browser';
  let osName = 'Unknown OS';
  let device = 'Desktop';

  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  if (/windows nt 10.0/i.test(ua)) osName = 'Windows 10 / 11';
  else if (/windows nt 6.3/i.test(ua)) osName = 'Windows 8.1';
  else if (/windows nt 6.1/i.test(ua)) osName = 'Windows 7';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
  else if (/android/i.test(ua)) osName = 'Android';
  else if (/linux/i.test(ua)) osName = 'Linux';

  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua)) browser = 'Apple Safari';

  return { browser, os: osName, device };
}
