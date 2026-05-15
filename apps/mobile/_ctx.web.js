// Custom expo-router context file for web - uses a relative path so Metro
// can correctly resolve the app directory via require.context
export const ctx = require.context(
  './app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/,
  'sync'
);
