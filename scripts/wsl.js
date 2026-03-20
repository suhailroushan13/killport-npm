'use strict';

const os = require('os');

/**
 * Heuristic: Linux kernel release from Microsoft ⇒ WSL.
 */
function isWsl() {
  if (process.platform !== 'linux') return false;
  const release = (os.release() || '').toLowerCase();
  return release.includes('microsoft') || release.includes('wsl');
}

module.exports = { isWsl };
