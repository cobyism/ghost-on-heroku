const get = require('lodash.get')
const ImgixClient = require('imgix-core-js')
const parse = require('hjson').parse
const App = require('ghost-app')

const client = new ImgixClient({
  host: process.env.ASSET_HOST_URL
})

const defaultParams = {
  auto: 'compress,format',
  ch: 'DPR,Width',
  w: 1200, // default to 1600, client-hint should override
  dpr: 2, // default to 2, client-hint should override
}

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('imgix_url', (path, options) => {
      const assetHostUrl = process.env.ASSET_HOST_URL
      const assetHostRegexp = new RegExp(assetHostUrl)
      const relativePath = path.replace(`https://${assetHostUrl}`, '')

      const params = get(options, 'hash.params', '{}')
      const parsedParams = parse(params.replace(/'/g, '"'))
      const imgixParams = Object.assign({}, parsedParams, defaultParams)

      console.log('***** imgix', {
        path,
        assetHostUrl,
        assetHostRegexp,
        relativePath,
        params,
        parsedParams,
        defaultParams,
        regexpText: assetHostRegexp.test(path)
      })

      if (assetHostRegexp.test(path)) {
        const url = client.buildURL(relativePath, imgixParams)
        console.log('***** imgix.url', { url })

        return url
      }

      return path
    })
  }
})
