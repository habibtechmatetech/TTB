module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    'module:react-native-dotenv',
    '@babel/preset-flow'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }]

    // strip flow types even without the @flow annotation (warning: check for unintended effects here with old packages)
    // ["@babel/plugin-transform-flow-strip-types", { "all": true }]
  ]
};
