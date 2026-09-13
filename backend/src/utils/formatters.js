/**
 * Formats seconds into human-readable duration string (e.g. "3d 4h 12m 30s")
 * @param {number} seconds
 * @returns {string}
 */
export function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ') || '0s';
}

/**
 * Converts bytes to megabytes rounded to integer
 * @param {number} bytes
 * @returns {number}
 */
export function bytesToMB(bytes) {
  return Math.round(bytes / (1024 * 1024));
}
