const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for web platform
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Use mock for react-native-maps on web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'react-native-maps-mock.web.js'),
      type: 'sourceFile',
    };
  }

  // Let Metro handle all other requests
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
