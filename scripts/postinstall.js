#!/usr/bin/env node
'use strict';

const { isWsl } = require('./wsl');

const tip = isWsl()
  ? 'WSL: same as Linux — run `killport <port>` or `npx killport-npm <port>`.'
  : 'Run `killport <port>` (global) or `npx killport-npm <port>`.';

console.log(`\n\x1b[32mkillport-npm\x1b[0m installed. ${tip}\n`);
