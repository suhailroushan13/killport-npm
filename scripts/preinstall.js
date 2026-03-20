#!/usr/bin/env node
'use strict';

const minMajor = 18;
const m = /^v(\d+)/.exec(process.version);
const major = m ? Number(m[1]) : 0;

if (major < minMajor) {
  console.error(
    `killport-npm requires Node.js ${minMajor}+ (you have ${process.version}).`,
  );
  process.exit(1);
}
