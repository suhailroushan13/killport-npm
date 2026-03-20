#!/usr/bin/env node
'use strict';

const readline = require('readline');
const { resolvePids } = require('../lib/resolve-pids');
const { killPids } = require('../lib/kill-pids');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function usage() {
  console.log(`killport — free a TCP listen port (Windows, macOS, Linux, WSL)

Usage:
  killport <port> [options]
  killport                    interactive prompt (TTY only)

Options:
  --dry-run    Show PIDs that would be killed; do not kill
  --graceful   SIGTERM / taskkill without /F first (Unix: then SIGKILL if needed)
  --help, -h   Show this help

Examples:
  killport 3000
  npx killport-npm 8080 --dry-run
`);
}

/**
 * @param {string} s
 */
function parsePort(s) {
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    return null;
  }
  return n;
}

function promptPort() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      `${GREEN}Please enter a port number: ${RESET}`,
      (answer) => {
        rl.close();
        resolve(answer.trim());
      },
    );
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const graceful = args.includes('--graceful');
  const pos = args.filter((a) => !a.startsWith('-'));
  let portStr = pos[0];

  if (!portStr) {
    if (!process.stdin.isTTY) {
      console.error(
        `${RED}Error: pass a port when stdin is not a TTY.${RESET}\n` +
          `Example: killport 3000`,
      );
      process.exit(1);
    }
    portStr = await promptPort();
  }

  const port = parsePort(portStr);
  if (port == null) {
    console.error(
      `${RED}Invalid port number. Use an integer between 1 and 65535.${RESET}`,
    );
    process.exit(1);
  }

  const platform = process.platform;
  let pids;
  try {
    pids = await resolvePids(port, platform);
  } catch (err) {
    console.error(
      `${RED}Could not inspect listeners (missing lsof/ss/netstat or permission denied).${RESET}`,
    );
    if (err.stderr?.trim()) console.error(err.stderr.trim());
    process.exit(1);
  }

  if (!pids.length) {
    console.error(
      `${RED}No process is listening on TCP port ${BLUE}${port}${RED}.${RESET}`,
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log(
      `${YELLOW}Dry run:${RESET} would kill PID(s): ${pids.join(', ')} on ${platform}`,
    );
    process.exit(0);
  }

  try {
    await killPids(pids, platform, { force: !graceful });
  } catch (err) {
    console.error(
      `${RED}Failed to terminate process(es). Try elevated permissions (sudo / Administrator).${RESET}`,
    );
    if (err.stderr?.trim()) console.error(err.stderr.trim());
    process.exit(1);
  }

  console.log(
    `${YELLOW}The process running on port ${BLUE}${port}${YELLOW} has been terminated.${RESET}`,
  );
}

main();
