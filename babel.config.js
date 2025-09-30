// babel.config.js   (use babel.config.cjs if your package.json has "type":"module")
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      require.resolve('react-native-reanimated/plugin'), // MUST be last
    ],
  };
};
