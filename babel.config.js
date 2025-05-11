module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // includes Expo-Router support
    plugins: [
      'react-native-reanimated/plugin', // compiles JSI glue
      ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }], // dotenv support
    ],
  };
};