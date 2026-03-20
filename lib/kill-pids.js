'use strict';

const { execCmd } = require('./exec-cmd');

/**
 * @param {string[]} pids
 * @param {NodeJS.Platform} platform
 * @param {{ force?: boolean }} opts
 */
async function killPids(pids, platform, opts = {}) {
  const force = opts.force !== false;
  if (!pids.length) return;

  if (platform === 'win32') {
    for (const pid of pids) {
      if (force) {
        await execCmd('taskkill.exe', ['/PID', pid, '/F']);
      } else {
        try {
          await execCmd('taskkill.exe', ['/PID', pid]);
        } catch {
          await execCmd('taskkill.exe', ['/PID', pid, '/F']);
        }
      }
    }
    return;
  }

  const sig = force ? '-9' : '-15';
  for (const pid of pids) {
    try {
      await execCmd('kill', [sig, pid]);
    } catch (err) {
      if (!force) {
        await execCmd('kill', ['-9', pid]);
      } else {
        throw err;
      }
    }
  }
}

module.exports = { killPids };
