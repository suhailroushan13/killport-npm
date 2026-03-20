#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  path.join(root, 'bin', 'killport.js'),
  path.join(root, 'lib', 'exec-cmd.js'),
  path.join(root, 'lib', 'resolve-pids.js'),
  path.join(root, 'lib', 'kill-pids.js'),
  path.join(root, 'scripts', 'preinstall.js'),
  path.join(root, 'scripts', 'postinstall.js'),
  path.join(root, 'scripts', 'prepublish.js'),
  path.join(root, 'scripts', 'wsl.js'),
  path.join(root, 'test', 'parse.test.js'),
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error(`prepublish: missing ${path.relative(root, f)}`);
    process.exit(1);
  }
  const r = spawnSync(process.execPath, ['--check', f], {
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log('prepublish: syntax check OK');
