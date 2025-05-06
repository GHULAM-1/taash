// babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],            // includes Expo-Router support
      plugins: ['react-native-reanimated/plugin'],// compiles JSI glue
    };
  };
  