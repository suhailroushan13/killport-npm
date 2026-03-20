'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

/**
 * @param {string} file
 * @param {string[]} args
 * @param {{ maxBuffer?: number }} [opts]
 */
async function execCmd(file, args, opts = {}) {
  const maxBuffer = opts.maxBuffer ?? 10 * 1024 * 1024;
  try {
    const { stdout, stderr } = await execFile(file, args, {
      maxBuffer,
      windowsHide: true,
    });
    return { stdout: stdout.toString(), stderr: stderr.toString() };
  } catch (err) {
    err.stdout = err.stdout?.toString?.() ?? '';
    err.stderr = err.stderr?.toString?.() ?? '';
    throw err;
  }
}

module.exports = { execCmd };
