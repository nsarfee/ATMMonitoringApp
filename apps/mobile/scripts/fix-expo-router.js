const path = require('path');
const fs = require('fs');

const fixed = `export const ctx = require.context(
  '../../app',
  true,
  /^(?:\\.\\/)?(?!(?:(?:(?:.*\\+api)|(?:\\+(html|native-intent))))\\.[tj]sx?$).*(?:\\.android|\\.ios|\\.native)?\\.[tj]sx?$/,
  'sync'
);
`;

// Patch all possible locations of _ctx.web.js
const candidates = [
  // From package resolution (handles both local and hoisted)
  (() => {
    try {
      const dir = path.dirname(require.resolve('expo-router/package.json'));
      return path.join(dir, '_ctx.web.js');
    } catch { return null; }
  })(),
  // Walk up from cwd to root node_modules
  path.join(process.cwd(), '../../node_modules/expo-router/_ctx.web.js'),
  path.join(process.cwd(), '../node_modules/expo-router/_ctx.web.js'),
  path.join(process.cwd(), 'node_modules/expo-router/_ctx.web.js'),
].filter(Boolean);

let patched = 0;
const seen = new Set();
for (const ctxPath of candidates) {
  const resolved = path.resolve(ctxPath);
  if (seen.has(resolved)) continue;
  seen.add(resolved);
  if (fs.existsSync(resolved)) {
    fs.writeFileSync(resolved, fixed, 'utf8');
    console.log('Fixed expo-router/_ctx.web.js at', resolved);
    patched++;
  }
}
if (patched === 0) {
  console.warn('Warning: expo-router/_ctx.web.js not found in expected locations');
}
