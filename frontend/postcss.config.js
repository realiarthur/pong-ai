module.exports = () => ({
  plugins: [
    require('postcss-preset-env')({
      stage: 1,
      features: {
        'nesting-rules': false,
        'custom-properties': true,
        'custom-media-queries': {
          importFrom: ['src/index.css']
        },
        'media-query-ranges': true,
        'custom-selectors': true,
        'matches-pseudo-class': true,
        'not-pseudo-class': true
      }
    }),
    require('postcss-nested')()
  ]
})
