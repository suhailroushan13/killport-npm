#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  parseWindowsNetstat,
  parseSsListenPidsForPort,
} = require('../lib/resolve-pids');

const winSample = `
Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1232
  TCP    127.0.0.1:3000         0.0.0.0:0              LISTENING       9999
  TCP    [::]:3000              [::]:0                 LISTENING       9999
  TCP    0.0.0.0:30000          0.0.0.0:0              LISTENING       1111
`;

assert.deepStrictEqual(parseWindowsNetstat(winSample, 3000).sort(), ['9999']);
assert.deepStrictEqual(parseWindowsNetstat(winSample, 30000).sort(), ['1111']);

const ssSample = `
State Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0 128 *:3000 *:* users:(("node",pid=42,fd=19))
LISTEN 0 128 127.0.0.1:3001 *:* users:(("node",pid=43,fd=20))
`;

assert.deepStrictEqual(parseSsListenPidsForPort(ssSample, 3000).sort(), ['42']);
assert.deepStrictEqual(parseSsListenPidsForPort(ssSample, 3001).sort(), ['43']);

console.log('parse tests: OK');
