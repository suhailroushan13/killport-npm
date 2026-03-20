'use strict';

const { execCmd } = require('./exec-cmd');

/**
 * @param {number} port
 * @param {NodeJS.Platform} platform
 * @returns {Promise<string[]>}
 */
async function resolvePids(port, platform) {
  if (platform === 'win32') {
    return resolveWindows(port);
  }
  if (platform === 'darwin') {
    return resolveDarwin(port);
  }
  if (platform === 'linux') {
    return resolveLinux(port);
  }
  throw new Error(`Unsupported platform: ${platform}`);
}

/**
 * @param {number} port
 */
async function resolveDarwin(port) {
  // macOS: `-iTCP:port` + `-sTCP:LISTEN` often misses real listeners (e.g. Next.js /
  // Turbopack). Parse full `lsof -i :port` output and keep only (LISTEN) rows.
  let stdout = '';
  try {
    const r = await execCmd('lsof', ['-nP', '-i', `:${port}`]);
    stdout = r.stdout;
  } catch (err) {
    const errOut = String(err.stdout ?? '').trim();
    if (err.code === 1 && errOut) {
      stdout = errOut;
    } else if (err.code === 1) {
      return [];
    } else {
      throw err;
    }
  }
  const parsed = parseLsofListenPids(stdout, port);
  if (parsed.length) return parsed;

  try {
    const { stdout: out2 } = await execCmd('lsof', [
      '-nP',
      `-iTCP:${port}`,
      '-sTCP:LISTEN',
      '-t',
    ]);
    return uniqueNumericPids(out2);
  } catch (err) {
    if (err.code === 1 && !err.stdout?.trim()) {
      return [];
    }
    throw err;
  }
}

/**
 * @param {number} port
 */
async function resolveLinux(port) {
  try {
    const { stdout } = await execCmd('ss', ['-tlnp']);
    const fromSs = parseSsListenPidsForPort(stdout, port);
    if (fromSs.length) return fromSs;
  } catch {
    // ss missing or error — fall through to lsof
  }

  let stdout = '';
  try {
    const r = await execCmd('lsof', ['-nP', '-i', `:${port}`]);
    stdout = r.stdout;
  } catch (err) {
    const errOut = String(err.stdout ?? '').trim();
    if (err.code === 1 && errOut) {
      stdout = errOut;
    } else if (err.code === 1) {
      return [];
    } else {
      throw err;
    }
  }
  const fromLsof = parseLsofListenPids(stdout, port);
  if (fromLsof.length) return fromLsof;

  try {
    const { stdout: out2 } = await execCmd('lsof', [
      '-nP',
      `-iTCP:${port}`,
      '-sTCP:LISTEN',
      '-t',
    ]);
    return uniqueNumericPids(out2);
  } catch (err) {
    if (err.code === 1 && !err.stdout?.trim()) {
      return [];
    }
    throw err;
  }
}

/**
 * @param {string} stdout
 * @param {number} port
 */
function parseSsListenPidsForPort(stdout, port) {
  const pids = new Set();
  const portStr = String(port);
  for (const line of stdout.split(/\n/)) {
    if (!/LISTEN/i.test(line)) continue;
    const localMatch =
      line.match(new RegExp(`:(?:${portStr})\\b`)) ||
      line.match(new RegExp(`\\]:${portStr}\\b`));
    if (!localMatch) continue;
    for (const m of line.matchAll(/pid=(\d+)/g)) {
      pids.add(m[1]);
    }
  }
  return [...pids];
}

/**
 * @param {number} port
 */
async function resolveWindows(port) {
  const { stdout } = await execCmd('netstat.exe', ['-ano', '-p', 'tcp']);
  return parseWindowsNetstat(stdout, port);
}

/**
 * @param {string} stdout
 * @param {number} port
 */
function parseWindowsNetstat(stdout, port) {
  const pids = new Set();
  const portStr = String(port);
  for (const line of stdout.split(/\r?\n/)) {
    if (!/LISTENING/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5 || parts[0].toUpperCase() !== 'TCP') continue;
    const local = parts[1];
    const idx = local.lastIndexOf(':');
    if (idx === -1) continue;
    if (local.slice(idx + 1) !== portStr) continue;
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) pids.add(pid);
  }
  return [...pids];
}

function uniqueNumericPids(stdout) {
  const pids = new Set();
  for (const line of stdout.split(/\n/)) {
    const t = line.trim();
    if (/^\d+$/.test(t)) pids.add(t);
  }
  return [...pids];
}

/**
 * Parse `lsof -nP -i :port` lines; only sockets in LISTEN state for that port.
 * @param {string} stdout
 * @param {number} port
 */
function parseLsofListenPids(stdout, port) {
  const pids = new Set();
  const portStr = String(port);
  const listenRe = new RegExp(`:${portStr}\\s+\\(LISTEN\\)`, 'i');
  for (const line of stdout.split('\n')) {
    if (!listenRe.test(line)) continue;
    const m = line.match(/^\S+\s+(\d+)\s+/);
    if (m) pids.add(m[1]);
  }
  return [...pids];
}

module.exports = {
  resolvePids,
  parseWindowsNetstat,
  parseSsListenPidsForPort,
  parseLsofListenPids,
};
