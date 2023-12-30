const postCssConfig = (config) => {
  const updatedConfig = { ...config }
  const loaders = updatedConfig.module.rules[1].oneOf
  loaders.forEach((loader) => {
    if (loader.use) {
      loader.use.forEach((item) => {
        if (item.options && item.options.ident === 'postcss') {
          const optionsConfig = {
            path: './postcss.config.js'
          }

          item.options.config = optionsConfig
          delete item.options.plugins
        }
      })
    }
  })

  return updatedConfig
}

module.exports = {
  webpack: (config) => {
    return postCssConfig(config)
  }
}
