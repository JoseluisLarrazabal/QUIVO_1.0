module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { reanimated: true }]],
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      'react-native-paper/babel',
    ],
  };
};