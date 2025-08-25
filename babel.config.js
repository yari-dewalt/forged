module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@sentry/react-native/expo',
      'react-native-reanimated/plugin', // Must be last!
    ],
  };
};
