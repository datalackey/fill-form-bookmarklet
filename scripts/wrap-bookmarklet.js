// Run from: project root
// Usage: node scripts/wrap-bookmarklet.js

import { readFileSync, writeFileSync } from 'fs';

var minified = readFileSync('dist/bookmarklet.js', 'utf8').trim();
var wrapped = 'javascript:' + encodeURIComponent(minified);

writeFileSync('dist/bookmarklet.txt', wrapped, 'utf8');

console.log('Bookmarklet written to dist/bookmarklet.txt');
console.log('Length: ' + wrapped.length + ' characters');
