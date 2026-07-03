// Run from: project root
// Usage: node scripts/wrap-bookmarklet.js

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

var gitHash = execSync('git rev-parse --short HEAD').toString().trim();
var versionStamp = 'var _v="' + gitHash + '";console.log("[bookmarklet] git:' + gitHash + '");';
var minified = readFileSync('dist/bookmarklet.js', 'utf8').trim();
var wrapped = 'javascript:' + encodeURIComponent(versionStamp + minified);

writeFileSync('dist/bookmarklet.txt', wrapped, 'utf8');

console.log('Bookmarklet written to dist/bookmarklet.txt');
console.log('Length: ' + wrapped.length + ' characters');
