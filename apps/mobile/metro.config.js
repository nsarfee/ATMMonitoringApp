const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Required: enable require.context for expo-router web support
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Force singleton packages to resolve from mobile's node_modules only.
// In a monorepo, packages like react/react-native can be found in multiple
// node_modules directories, causing "multiple React instances" runtime crashes.
const SINGLETON_PACKAGES = [
  'react',
  'react-dom',
  'react-native',
  'react-native-web',
  '@react-navigation/core',
  '@react-navigation/native',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETON_PACKAGES.includes(moduleName)) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Watch the monorepo root so Metro can find @atm/shared
config.watchFolders = [workspaceRoot];

// Tell Metro where to look for modules: local first, then workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
