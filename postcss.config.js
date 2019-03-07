module.exports = {
  plugins: [
    require('postcss-import')({}),
    require('postcss-url')({ url: 'copy', useHash: true }),
    require('postcss-preset-env')
  ]
};
